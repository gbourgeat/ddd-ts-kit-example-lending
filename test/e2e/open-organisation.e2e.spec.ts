import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { collectEvents, expectStatus, type HttpClient } from '@ddd-ts-kit/testing/e2e';
import { expectSpanTree, installTestTracing } from '@ddd-ts-kit/tracing/testing';
import { startKeycloakStandIn } from '$test/e2e/support/identity/keycloak-stand-in';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { storyOf } from '$test/e2e/support/story-of';

const acme = { slug: 'acme-bank', name: 'Acme Bank' };

// Exact on names and structure, and kept before the tests whose request leaves work behind (a relay still publishing would add its spans here). Once "open organisation" announces a fact, its spans come after the save, under `unit-of-work before-commit`: `domain-event <name>`, `handler <Class>`, `outbox append <type>`, then, once `application.settled()` has resolved inside `traceOf`, `publish <type>` and `process <consumer>` with the command it sends.
const openingSpans = [
  {
    name: 'POST /organisations',
    kind: 'SERVER' as const,
    children: [
      {
        name: 'command OpenOrganisationCommand',
        children: [
          { name: 'repository AccountRepository.findById' },
          { name: 'repository OrganisationRepository.findById' },
          { name: 'repository OrganisationRepository.save' },
          { name: 'repository MemberRepository.save' },
          {
            name: 'unit-of-work before-commit',
            children: [
              {
                name: 'domain-event identity.organisation.opened',
                children: [
                  {
                    name: 'handler OrganisationOpenedPublisher',
                    children: [{ name: 'outbox append identity.organisation.opened' }],
                  },
                ],
              },
              {
                name: 'domain-event identity.member.joined',
                children: [
                  {
                    name: 'handler MemberJoinedPublisher',
                    children: [{ name: 'outbox append identity.member.joined' }],
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

describe('Open organisation, end to end', () => {
  const tracing = installTestTracing();
  let application: RunningApplication;
  let provider: { close: () => Promise<void> };

  /** A signed-in person whose account is provisioned at its first sign-in, as the identity provider lets it be. */
  async function provisioned(id: string, roles: string[] = []): Promise<HttpClient> {
    const person = await application.as({ id, roles });

    expectStatus(await person.put('/accounts/me', {}), 200);

    return person;
  }

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
    const response = await application.client.post('/organisations', acme);

    expectStatus(response, 401);
  });

  it('answers 403 to an actor who does not hold the permission', async () => {
    const stranger = await provisioned('stranger');

    const response = await stranger.post('/organisations', acme);

    expectStatus(response, 403);
  });

  it('is one trace: the request, the use case and what it saves', async () => {
    await application.relate({ object: 'context:identity', relation: 'operator', subject: 'user:ada' });
    const ada = await provisioned('ada', ['admin']);

    const trace = await tracing.traceOf(async () => {
      expectStatus(await ada.post('/organisations', acme), 201);
    });

    expectSpanTree(storyOf(trace), openingSpans);
  });

  it('answers 201 to POST /organisations', async () => {
    await application.relate({ object: 'context:identity', relation: 'operator', subject: 'user:ada' });
    const ada = await provisioned('ada', ['admin']);

    const response = await ada.post('/organisations', acme);

    expectStatus(response, 201);
  });

  it('lets a client observe the outcome of "open organisation" through the API', async () => {
    await application.relate({ object: 'context:identity', relation: 'operator', subject: 'user:ada' });
    const ada = await provisioned('ada', ['admin']);
    const opened = await ada.post('/organisations', acme);
    const { id } = opened.body as { id: string };

    const members = await ada.get(`/organisations/${id}/members`);

    expectStatus(members, 200);
    expect(JSON.stringify(members.body)).toContain('ada');
  });

  it('publishes the integration events other contexts rely on', async () => {
    await application.relate({ object: 'context:identity', relation: 'operator', subject: 'user:ada' });
    const ada = await provisioned('ada', ['admin']);
    const recorder = collectEvents(application.events, ['identity.organisation.opened']);

    expectStatus(await ada.post('/organisations', acme), 201);

    await application.settled();
    recorder.stop();

    expect(recorder.received('identity.organisation.opened')).toHaveLength(1);
  });

  it('answers the documented problem for each business refusal', async () => {
    await application.relate({ object: 'context:identity', relation: 'operator', subject: 'user:ada' });
    const ada = await provisioned('ada', ['admin']);

    expectStatus(await ada.post('/organisations', acme), 201);

    const taken = await ada.post('/organisations', acme);
    const invalid = await ada.post('/organisations', { slug: 'Acme Bank!', name: 'Acme Bank' });

    expect(taken.body).toMatchObject({ code: 'ORGANISATION_SLUG_TAKEN' });
    expect(invalid.body).toMatchObject({ code: 'INVALID_ORGANISATION_SLUG' });
  });
});
