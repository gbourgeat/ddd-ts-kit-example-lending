import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus, type HttpClient } from '@ddd-ts-kit/testing/e2e';
import { operatorOf } from '$test/e2e/support/credit-scoring/operator-of';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';

const version = { modelRisk: 'medium', label: '2026.1' };

const soundApplicant = {
  debtToIncomePercent: 20,
  repaymentIncidents: 0,
  residualIncomeCents: 120000,
  modelVersion: '2026.1',
};

const riskyApplicant = {
  debtToIncomePercent: 45,
  repaymentIncidents: 2,
  residualIncomeCents: 120000,
  modelVersion: '2026.1',
};

describe('Score applicant, end to end', () => {
  let application: RunningApplication;

  beforeAll(async () => {
    application = await startApplication();
  });

  afterAll(async () => {
    await application.close();
  });

  beforeEach(async () => {
    await application.reset();
  });

  it('answers 401 to a caller who presents no credential', async () => {
    const response = await application.client.post('/scores', soundApplicant);

    expectStatus(response, 401);
  });

  it('answers 403 to an actor without a relation to the context', async () => {
    const stranger = await application.as({ id: 'stranger', tenantId: 'acme-bank' });

    const response = await stranger.post('/scores', soundApplicant);

    expectStatus(response, 403);
  });

  it('answers the score 100, the green band and no factor to a clean applicant, with the model version', async () => {
    const operator = await publishedOperator();

    const response = await operator.post('/scores', soundApplicant);

    expectStatus(response, 200);

    expect(response.body).toMatchObject({
      score: 100,
      band: 'green',
      modelVersion: '2026.1',
      factors: [],
    });
  });

  it('answers the score 20 in the red band, with the factors in words, to an applicant with two incidents and a high debt ratio', async () => {
    const operator = await publishedOperator();

    const response = await operator.post('/scores', riskyApplicant);

    expectStatus(response, 200);

    expect(response.body).toMatchObject({
      score: 20,
      band: 'red',
      modelVersion: '2026.1',
      inputs: { debtToIncomePercent: 45, repaymentIncidents: 2, residualIncomeCents: 120000 },
      factors: [
        'Your debts take a large share of your income',
        'A repayment incident is registered in your name',
        'A repayment incident is registered in your name',
      ],
    });
  });

  it('answers 422 with UNKNOWN_MODEL_VERSION to a model version label that no published version carries', async () => {
    const operator = await publishedOperator();

    const response = await operator.post('/scores', { ...soundApplicant, modelVersion: '2030.9' });

    expectStatus(response, 422);
    expect(response.body).toMatchObject({ code: 'UNKNOWN_MODEL_VERSION' });
  });

  /** An operator of credit-scoring, with the model version 2026.1 published by the bank. */
  async function publishedOperator(): Promise<HttpClient> {
    const operator = await operatorOf(application, 'olivia');

    expectStatus(await operator.post('/scoring-models', version), 201);

    return operator;
  }
});
