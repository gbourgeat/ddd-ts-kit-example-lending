import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { collectEvents, expectStatus, type HttpClient } from '@ddd-ts-kit/testing/e2e';
import { expectSpanTree, installTestTracing } from '@ddd-ts-kit/tracing/testing';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { storyOf } from '$test/e2e/support/story-of';

const tenantId = 'acme-bank';

/** Exact on names and structure: the declarer is read from the actor, then the conflict is saved and relayed. */
const declaringSpans = [
  {
    name: 'POST /conflicts',
    kind: 'SERVER' as const,
    children: [
      {
        name: 'command DeclareConflictOfInterestCommand',
        children: [
          { name: 'repository StaffMemberRepository.findByAccountId' },
          { name: 'repository ConflictOfInterestRepository.save' },
          {
            name: 'unit-of-work before-commit',
            children: [
              {
                name: 'domain-event branch-network.conflict-of-interest.declared',
                children: [
                  {
                    name: 'handler ConflictOfInterestDeclaredPublisher',
                    children: [
                      {
                        name: 'outbox append branch-network.conflict-of-interest.declared',
                        children: [
                          {
                            name: 'publish branch-network.conflict-of-interest.declared',
                            children: [
                              {
                                name: 'process branch-network.conflict-of-interest.declared',
                                children: [{ name: 'repository DeclaredConflictsStore.keep' }],
                              },
                              { name: 'process branch-network.conflict-of-interest.declared' },
                            ],
                          },
                        ],
                      },
                    ],
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

describe('Declare conflict of interest, end to end', () => {
  const tracing = installTestTracing();
  let application: RunningApplication;

  beforeAll(async () => {
    application = await startApplication();
  });

  afterAll(async () => {
    await application.close();
    tracing.uninstall();
  });

  it('answers 401 to a caller who presents no credential', async () => {
    const response = await application.client.post('/conflicts', {});

    expectStatus(response, 401);
  });

  it('answers 403 to an actor who does not hold the permission', async () => {
    const stranger = await application.as({ id: 'stranger', tenantId });

    const response = await stranger.post('/conflicts', {});

    expectStatus(response, 403);
  });

  it('records the conflict of interest a member of staff declares on another customer, and publishes it', async () => {
    const grace = await staffMember(application, 'grace-1', 'customer-grace-1');
    const recorder = collectEvents(application.events, ['branch-network.conflict-of-interest.declared']);

    expectStatus(await grace.post('/conflicts', { customerId: 'customer-2' }), 201);

    await application.settled();
    recorder.stop();

    expect(recorder.received('branch-network.conflict-of-interest.declared')).toHaveLength(1);
  });

  it('refuses the conflict a member of staff declares on their own customer file, with the code CONFLICT_ON_OWN_RECORD', async () => {
    const grace = await staffMember(application, 'grace-2', 'customer-grace-2');

    const response = await grace.post('/conflicts', { customerId: 'customer-grace-2' });

    expectStatus(response, 422);
    expect(response.body).toMatchObject({ code: 'CONFLICT_ON_OWN_RECORD' });
  });

  it('refuses a declaration from an account that is no member of staff, with the code UNKNOWN_STAFF_MEMBER', async () => {
    await application.relate({ object: 'context:branch-network', relation: 'operator', subject: 'user:no-staff' });
    const person = await application.as({ id: 'no-staff', tenantId });

    const response = await person.post('/conflicts', { customerId: 'customer-3' });

    expectStatus(response, 422);
    expect(response.body).toMatchObject({ code: 'UNKNOWN_STAFF_MEMBER' });
  });

  it('is one trace: the request, the use case and what it reads and saves', async () => {
    const grace = await staffMember(application, 'grace-4');

    await application.settled();

    const trace = await tracing.traceOf(async () => {
      expectStatus(await grace.post('/conflicts', { customerId: 'customer-4' }), 201);
      await application.settled();
    });

    expectSpanTree(storyOf(trace), declaringSpans);
  });
});

/** A signed-in member of staff, appointed on a branch they opened: the account is linked to their own customer file when given. */
async function staffMember(
  application: RunningApplication,
  accountId: string,
  ownCustomerId?: string,
): Promise<HttpClient> {
  await application.relate({ object: 'context:branch-network', relation: 'operator', subject: `user:${accountId}` });
  const person = await application.as({ id: accountId, tenantId });

  const opened = await person.post('/branches', {});

  expectStatus(opened, 201);
  const { id: branchId } = opened.body as { id: string };

  const appointed = await person.post(`/branches/${branchId}/staff`, {
    name: 'Grace Hopper',
    email: `${accountId}@example.test`,
    accountId,
    ownCustomerId,
  });

  expectStatus(appointed, 201);

  return person;
}
