import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { collectEvents, expectStatus } from '@ddd-ts-kit/testing/e2e';
import { expectSpanTree, installTestTracing } from '@ddd-ts-kit/tracing/testing';
import { operatorOf } from '$test/e2e/support/credit-policy/operator-of';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { storyOf } from '$test/e2e/support/story-of';

const rateGrid = { productId: 'personal-loan', effectiveFrom: '2026-03-01' };

describe('Publish rate grid, end to end', () => {
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
    const response = await application.client.post('/rate-grids', {});

    expectStatus(response, 401);
  });

  it('answers 403 to an actor who does not hold the permission', async () => {
    const stranger = await application.as({ id: 'stranger' });

    const response = await stranger.post('/rate-grids', rateGrid);

    expectStatus(response, 403);
  });

  it('is one trace: the request, the use case and what it saves', async () => {
    const ada = await operatorOf(application, 'ada');

    const trace = await tracing.traceOf(async () => {
      expectStatus(await ada.post('/rate-grids', rateGrid), 201);
    });

    // Exact on names and structure, and kept before the tests whose request leaves work behind (a relay still publishing would add its spans here). Once "publish rate grid" announces a fact, its spans come after the save, under `unit-of-work before-commit`: `domain-event <name>`, `handler <Class>`, `outbox append <type>`, then, once `application.settled()` has resolved inside `traceOf`, `publish <type>` and `process <consumer>` with the command it sends.
    expectSpanTree(storyOf(trace), [
      {
        name: 'POST /rate-grids',
        kind: 'SERVER',
        children: [
          {
            name: 'command PublishRateGridCommand',
            children: [
              { name: 'repository RateGridRepository.save' },
              {
                name: 'unit-of-work before-commit',
                children: [
                  {
                    name: 'domain-event credit-policy.rate-grid.published',
                    children: [
                      {
                        name: 'handler RateGridPublishedPublisher',
                        children: [{ name: 'outbox append credit-policy.rate-grid.published' }],
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

  it('answers 201 to POST /rate-grids', async () => {
    const ada = await operatorOf(application, 'ada');

    const response = await ada.post('/rate-grids', rateGrid);

    expectStatus(response, 201);
  });

  it('publishes the rate grid of a product as version 2, with its product and date of effect', async () => {
    const ada = await operatorOf(application, 'ada');
    const recorder = collectEvents(application.events, ['credit-policy.rate-grid.published']);

    expectStatus(await ada.post('/rate-grids', rateGrid), 201);

    await application.settled();
    recorder.stop();

    expect(recorder.received('credit-policy.rate-grid.published')).toEqual([
      expect.objectContaining({
        version: 2,
        payload: { rateGridId: expect.any(String), productId: 'personal-loan', effectiveFrom: '2026-03-01' },
      }),
    ]);
  });
});
