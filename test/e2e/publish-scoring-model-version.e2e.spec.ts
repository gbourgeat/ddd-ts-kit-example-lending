import { afterAll, beforeAll, beforeEach, describe, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { expectSpanTree, installTestTracing } from '@ddd-ts-kit/tracing/testing';
import { operatorOf } from '$test/e2e/support/credit-scoring/operator-of';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { storyOf } from '$test/e2e/support/story-of';

const version = { modelRisk: 'medium', label: '2026.1' };

describe('Publish scoring model version, end to end', () => {
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
    const response = await application.client.post('/scoring-models', version);

    expectStatus(response, 401);
  });

  it('answers 403 to an actor without a relation to the context', async () => {
    const stranger = await application.as({ id: 'stranger', tenantId: 'acme-bank' });

    const response = await stranger.post('/scoring-models', version);

    expectStatus(response, 403);
  });

  it('answers 201 with the published version: its id, its number, its model risk and its label', async () => {
    const operator = await operatorOf(application, 'olivia');

    const response = await operator.post('/scoring-models', version);

    expectStatus(response, 201);
  });

  it('numbers each version after the last one published, from 1', async () => {
    const operator = await operatorOf(application, 'olivia');

    await operator.post('/scoring-models', version);

    const response = await operator.post('/scoring-models', { modelRisk: 'high', label: '2026.2' });

    expectStatus(response, 201);
  });

  it('answers 422 to a model risk that is not low, medium or high', async () => {
    const operator = await operatorOf(application, 'olivia');

    const response = await operator.post('/scoring-models', { modelRisk: 'extreme', label: '2026.1' });

    expectStatus(response, 422);
  });

  it('answers 422 with SCORING_MODEL_LABEL_REQUIRED to a blank label', async () => {
    const operator = await operatorOf(application, 'olivia');

    const response = await operator.post('/scoring-models', { modelRisk: 'low', label: '   ' });

    expectStatus(response, 422);
  });

  it('is one trace: the request, the use case and what it reads and saves', async () => {
    const operator = await operatorOf(application, 'olivia');

    const trace = await tracing.traceOf(async () => {
      expectStatus(await operator.post('/scoring-models', version), 201);
    });

    expectSpanTree(storyOf(trace), [
      {
        name: 'POST /scoring-models',
        kind: 'SERVER',
        children: [
          {
            name: 'command PublishScoringModelVersionCommand',
            children: [
              { name: 'repository ScoringModelRepository.findById' },
              { name: 'repository ScoringModelRepository.save' },
              {
                name: 'unit-of-work before-commit',
                children: [{ name: 'domain-event credit-scoring.scoring-model.published' }],
              },
            ],
          },
        ],
      },
    ]);
  });
});
