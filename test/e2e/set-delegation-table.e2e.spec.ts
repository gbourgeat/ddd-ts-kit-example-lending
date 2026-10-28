import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { collectEvents, expectStatus } from '@ddd-ts-kit/testing/e2e';
import { expectSpanTree, installTestTracing } from '@ddd-ts-kit/tracing/testing';
import { operatorOf } from '$test/e2e/support/credit-policy/operator-of';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { storyOf } from '$test/e2e/support/story-of';

const delegationTable = {
  effectiveFrom: '2026-03-01',
  advisorLimitCents: 1_500_000,
  creditAnalystLimitCents: 7_500_000,
  riskManagerLimitCents: 25_000_000,
  creditCommitteeLimitCents: 100_000_000,
};

describe('Set delegation table, end to end', () => {
  const tracing = installTestTracing();
  let application: RunningApplication;

  beforeAll(async () => {
    application = await startApplication();
  });

  afterAll(async () => {
    await application.close();
    tracing.uninstall();
  });

  beforeEach(async () => {
    await application.reset();
  });

  it('answers 401 to a caller who presents no credential', async () => {
    const response = await application.client.put('/delegation-table', {});

    expectStatus(response, 401);
  });

  it('answers 403 to an actor who does not hold the permission', async () => {
    const stranger = await application.as({ id: 'stranger' });

    const response = await stranger.put('/delegation-table', delegationTable);

    expectStatus(response, 403);
  });

  it('is one trace: the request, the use case and what it saves', async () => {
    const ada = await operatorOf(application, 'ada');

    const trace = await tracing.traceOf(async () => {
      expectStatus(await ada.put('/delegation-table', delegationTable), 200);
    });

    // Exact on names and structure, and kept before the tests whose request leaves work behind (a relay still publishing would add its spans here). Once "set delegation table" announces a fact, its spans come after the save, under `unit-of-work before-commit`: `domain-event <name>`, `handler <Class>`, `outbox append <type>`, then, once `application.settled()` has resolved inside `traceOf`, `publish <type>` and `process <consumer>` with the command it sends.
    expectSpanTree(storyOf(trace), [
      {
        name: 'PUT /delegation-table',
        kind: 'SERVER',
        children: [
          {
            name: 'command SetDelegationTableCommand',
            children: [
              { name: 'repository DelegationTableRepository.save' },
              {
                name: 'unit-of-work before-commit',
                children: [
                  {
                    name: 'domain-event credit-policy.delegation-table.published',
                    children: [
                      {
                        name: 'handler DelegationTablePublishedPublisher',
                        children: [{ name: 'outbox append credit-policy.delegation-table.published' }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ]);
  });

  it('answers 200 to PUT /delegation-table', async () => {
    const ada = await operatorOf(application, 'ada');

    const response = await ada.put('/delegation-table', delegationTable);

    expectStatus(response, 200);
  });

  it('publishes the delegation table as version 2, with each level, its amount and the date of effect', async () => {
    const ada = await operatorOf(application, 'ada');
    const recorder = collectEvents(application.events, ['credit-policy.delegation-table.published']);

    expectStatus(await ada.put('/delegation-table', delegationTable), 200);

    await application.settled();
    recorder.stop();

    expect(recorder.received('credit-policy.delegation-table.published')).toEqual([
      expect.objectContaining({
        version: 2,
        payload: {
          delegationTableId: expect.any(String),
          effectiveFrom: '2026-03-01',
          levels: [
            { level: 'advisor', amountCents: 1_500_000 },
            { level: 'credit-analyst', amountCents: 7_500_000 },
            { level: 'risk-manager', amountCents: 25_000_000 },
            { level: 'credit-committee', amountCents: 100_000_000 },
          ],
        },
      }),
    ]);
  });
});
