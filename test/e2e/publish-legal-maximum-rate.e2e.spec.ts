import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { collectEvents, expectStatus } from '@ddd-ts-kit/testing/e2e';
import { expectSpanTree, installTestTracing } from '@ddd-ts-kit/tracing/testing';
import { operatorOf } from '$test/e2e/support/credit-policy/operator-of';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { storyOf } from '$test/e2e/support/story-of';

const legalMaximumRate = { category: 'car', rateBasisPoints: 1250, effectiveFrom: '2026-03-01' };

const EXPECTED_SPAN_TREE: Parameters<typeof expectSpanTree>[1] = [
  {
    name: 'POST /legal-maximum-rates',
    kind: 'SERVER',
    children: [
      {
        name: 'command PublishLegalMaximumRateCommand',
        children: [
          { name: 'repository LegalMaximumRateRepository.findLatestOf' },
          { name: 'repository LegalMaximumRateRepository.save' },
          {
            name: 'unit-of-work before-commit',
            children: [
              {
                name: 'domain-event credit-policy.legal-maximum-rate.published',
                children: [
                  {
                    name: 'handler LegalMaximumRatePublishedPublisher',
                    children: [{ name: 'outbox append credit-policy.legal-maximum-rate.published' }],
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

describe('Publish legal maximum rate, end to end', () => {
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
    const response = await application.client.post('/legal-maximum-rates', {});

    expectStatus(response, 401);
  });

  it('answers 403 to an actor who does not hold the permission', async () => {
    const stranger = await application.as({ id: 'stranger' });

    const response = await stranger.post('/legal-maximum-rates', legalMaximumRate);

    expectStatus(response, 403);
  });

  it('is one trace: the request, the use case and what it saves', async () => {
    const ada = await operatorOf(application, 'ada');

    const trace = await tracing.traceOf(async () => {
      expectStatus(await ada.post('/legal-maximum-rates', legalMaximumRate), 201);
    });

    // Exact on names and structure, and kept before the tests whose request leaves work behind (a relay still publishing would add its spans here). Once "publish legal maximum rate" announces a fact, its spans come after the save, under `unit-of-work before-commit`: `domain-event <name>`, `handler <Class>`, `outbox append <type>`, then, once `application.settled()` has resolved inside `traceOf`, `publish <type>` and `process <consumer>` with the command it sends.
    expectSpanTree(storyOf(trace), EXPECTED_SPAN_TREE);
  });

  it('answers 201 to POST /legal-maximum-rates', async () => {
    const ada = await operatorOf(application, 'ada');

    const response = await ada.post('/legal-maximum-rates', legalMaximumRate);

    expectStatus(response, 201);
  });

  it('publishes the legal maximum rate of a category as version 2, with its rate and date of effect', async () => {
    const ada = await operatorOf(application, 'ada');
    const recorder = collectEvents(application.events, ['credit-policy.legal-maximum-rate.published']);

    expectStatus(await ada.post('/legal-maximum-rates', legalMaximumRate), 201);

    await application.settled();
    recorder.stop();

    expect(recorder.received('credit-policy.legal-maximum-rate.published')).toEqual([
      expect.objectContaining({
        version: 2,
        payload: {
          legalMaximumRateId: expect.any(String),
          category: 'car',
          rateBasisPoints: 1250,
          effectiveFrom: '2026-03-01',
        },
      }),
    ]);
  });
});
