import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { collectEvents, expectStatus, type HttpClient } from '@ddd-ts-kit/testing/e2e';
import { expectSpanTree, installTestTracing } from '@ddd-ts-kit/tracing/testing';
import { startKeycloakStandIn } from '$test/e2e/support/identity/keycloak-stand-in';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { storyOf } from '$test/e2e/support/story-of';

/** The tenant the scenarios work in: the audit trail is kept per tenant, and a reader of it must act in one. */
const tenantId = 'acme-bank';

const lending = {
  delegateId: 'bob',
  rights: ['read-members'],
  startsAt: new Date().toISOString(),
  endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
};

// Exact on names and structure, and kept before the tests whose request leaves work behind (a relay still publishing would add its spans here). Once "grant delegation" announces a fact, its spans come after the save, under `unit-of-work before-commit`: `domain-event <name>`, `handler <Class>`, `outbox append <type>`, then, once `application.settled()` has resolved inside `traceOf`, `publish <type>` and `process <consumer>` with the command it sends.
const grantingSpans = [
  {
    name: 'POST /organisations/:organisationId/delegations',
    kind: 'SERVER' as const,
    children: [
      {
        name: 'command GrantDelegationCommand',
        children: [
          { name: 'repository MemberRepository.findOf' },
          { name: 'repository MemberRepository.findOf' },
          { name: 'repository DelegationRepository.save' },
          {
            name: 'unit-of-work before-commit',
            children: [
              {
                name: 'domain-event identity.delegation.granted',
                children: [
                  {
                    name: 'handler DelegationGrantedPublisher',
                    children: [{ name: 'outbox append identity.delegation.granted' }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

describe('Grant delegation, end to end', () => {
  const tracing = installTestTracing();
  let application: RunningApplication;
  let provider: { close: () => Promise<void> };

  beforeAll(async () => {
    provider = await startKeycloakStandIn();
    application = await startApplication();
  });

  afterAll(async () => {
    await application.close();
    await provider.close();
    tracing.uninstall();
  });

  beforeEach(async () => {
    await application.reset();
  });

  it('answers 401 to a caller who presents no credential', async () => {
    const response = await application.client.post('/organisations/organisation-id-1/delegations', {});

    expectStatus(response, 401);
  });

  it('answers 403 to an actor who does not hold the permission', async () => {
    const stranger = await application.as({ id: 'stranger', tenantId });

    const response = await stranger.post('/organisations/organisation-id-1/delegations', lending);

    expectStatus(response, 403);
  });

  it('is one trace: the request, the use case and what it saves', async () => {
    const { ada, organisationId } = await organisationWithMember(application);

    const trace = await tracing.traceOf(async () => {
      expectStatus(await ada.post(`/organisations/${organisationId}/delegations`, lending), 201);
    });

    expectSpanTree(storyOf(trace), grantingSpans);
  });

  it('answers 201 to POST /organisations/:organisationId/delegations', async () => {
    const { ada, organisationId } = await organisationWithMember(application);

    const response = await ada.post(`/organisations/${organisationId}/delegations`, lending);

    expectStatus(response, 201);
  });

  it('keeps an entry of the grant in the audit trail, written without the use case asking for it', async () => {
    const { ada, organisationId } = await organisationWithMember(application);

    await application.relate({ object: 'context:audit', relation: 'operator', subject: 'user:ada' });
    expectStatus(await ada.post(`/organisations/${organisationId}/delegations`, lending), 201);

    const trail = await ada.get('/audit/entries?action=GrantDelegationCommand');
    const { items } = trail.body as { items: { action: string; outcome: string; actorId: string }[] };

    expectStatus(trail, 200);

    expect(items).toContainEqual(
      expect.objectContaining({ action: 'GrantDelegationCommand', outcome: 'succeeded', actorId: 'ada' }),
    );
  });

  it('publishes the integration events other contexts rely on', async () => {
    const { ada, organisationId } = await organisationWithMember(application);
    const recorder = collectEvents(application.events, ['identity.delegation.granted']);

    expectStatus(await ada.post(`/organisations/${organisationId}/delegations`, lending), 201);

    await application.settled();
    recorder.stop();

    expect(recorder.received('identity.delegation.granted')).toHaveLength(1);
  });

  it('refuses a delegation to someone who is not a member, by its code', async () => {
    const { ada, organisationId } = await organisationWithMember(application);

    const response = await ada.post(`/organisations/${organisationId}/delegations`, {
      ...lending,
      delegateId: 'stranger',
    });

    expect(response.body).toMatchObject({ code: 'MEMBER_NOT_FOUND' });
  });
});

/** An organisation opened by ada, with bob as its member and the invitation accepted: ada can grant bob a delegation. */
async function organisationWithMember(
  application: RunningApplication,
): Promise<{ ada: HttpClient; organisationId: string }> {
  await application.relate({ object: 'context:identity', relation: 'operator', subject: 'user:ada' });
  const ada = await provisionedPerson(application, 'ada', ['admin']);
  const opened = await ada.post('/organisations', { slug: 'acme-bank', name: 'Acme Bank' });
  const { id: organisationId } = opened.body as { id: string };

  const invitation = await ada.post(`/organisations/${organisationId}/invitations`, {
    email: 'bob@example.test',
    role: 'member',
  });

  const { token } = invitation.body as { token: string };
  const bob = await provisionedPerson(application, 'bob');

  expectStatus(await bob.post('/invitations/acceptance', { token }), 200);
  await application.settled();

  return { ada, organisationId };
}

/** A signed-in person whose account is provisioned at its first sign-in, as the identity provider lets it be. */
async function provisionedPerson(
  application: RunningApplication,
  id: string,
  roles: string[] = [],
): Promise<HttpClient> {
  const person = await application.as({ id, roles, tenantId });

  expectStatus(await person.put('/accounts/me', {}), 200);

  return person;
}
