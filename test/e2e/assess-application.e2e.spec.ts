import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus, type HttpClient } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { aPersonBody, operatorOf } from '$test/e2e/support/customer-due-diligence/customer-files';
import { operatorOf as creditScoringOperatorOf } from '$test/e2e/support/credit-scoring/operator-of';

const request = { productId: 'personal-loan', amount: { cents: 1234567, currency: 'EUR' }, durationMonths: 60 };
const borrowerBody = { ...aPersonBody('12AB34567'), name: 'Ada Lovelace', birthDate: '1980-05-01T00:00:00.000Z' };
const version = { modelRisk: 'medium', label: '2026.1' };

describe('Assess application, end to end', () => {
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

  /** The borrower submits an application, which she owns: the applicant of the file. */
  async function submittedApplication(): Promise<{ applicationId: string; applicant: HttpClient }> {
    const operator = await operatorOf(application, 'ada');
    const borrowerId = (expectStatus(await operator.post('/customers', borrowerBody), 201).body as { id: string }).id;

    await application.relate({ object: `customer:${borrowerId}`, relation: 'self', subject: `user:${borrowerId}` });
    const applicant = await application.as({ id: borrowerId, tenantId: 'acme-bank' });
    const submitted = expectStatus(await applicant.post('/applications', request), 201);
    const applicationId = (submitted.body as { id: string }).id;

    await application.relate({
      object: `application:${applicationId}`,
      relation: 'customer',
      subject: `customer:${borrowerId}`,
    });

    return { applicationId, applicant };
  }

  /** The applicant consents and the accounts are read, then the register is consulted: what an assessment rests on. */
  async function applicationWithAccountsAndRegister(): Promise<string> {
    const { applicationId, applicant } = await submittedApplication();

    expectStatus(await applicant.post(`/applications/${applicationId}/consent`, {}), 201);
    expectStatus(await applicant.post(`/applications/${applicationId}/account-information`, {}), 201);

    const credit = await analyst();

    expectStatus(await credit.post(`/applications/${applicationId}/register-consultations`, {}), 201);

    return applicationId;
  }

  /** A credit analyst, an operator of the context, who assesses the applications. */
  async function analyst(): Promise<HttpClient> {
    await application.relate({
      object: 'context:credit-application',
      relation: 'operator',
      subject: 'user:credit-analyst',
    });

    return application.as({ id: 'credit-analyst', tenantId: 'acme-bank' });
  }

  it('answers 401 to a caller who presents no credential', async () => {
    const response = await application.client.post('/applications/id-1/assessment', {});

    expectStatus(response, 401);
  });

  it('answers 403 to an actor who does not hold the permission', async () => {
    const stranger = await application.as({ id: 'stranger', tenantId: 'acme-bank' });

    const response = await stranger.post('/applications/id-1/assessment', {});

    expectStatus(response, 403);
  });

  it('proposes approve, with the model version, the inputs, the score and the factors, for a green band and a positive residual income: 201', async () => {
    const applicationId = await applicationWithAccountsAndRegister();
    const operator = await creditScoringOperatorOf(application, 'olivia');

    expectStatus(await operator.post('/scoring-models', version), 201);

    const credit = await analyst();
    const response = expectStatus(await credit.post(`/applications/${applicationId}/assessment`, {}), 201);

    expect(response.body).toMatchObject({
      applicationId,
      modelVersion: '2026.1',
      debtToIncomePercent: 36,
      repaymentIncidents: 0,
      residualIncomeCents: 160_000,
      score: 85,
      proposedOutcome: 'approve',
      factors: ['Your debts take a share of your income that is close to the limit'],
    });
  });

  it('proposes a refusal, never a refusal itself, when the register lists the applicant: 201', async () => {
    application.incidents.record('Ada Lovelace', new Date('1980-05-01T00:00:00.000Z'));
    const applicationId = await applicationWithAccountsAndRegister();
    const operator = await creditScoringOperatorOf(application, 'olivia');

    expectStatus(await operator.post('/scoring-models', version), 201);

    const credit = await analyst();
    const response = expectStatus(await credit.post(`/applications/${applicationId}/assessment`, {}), 201);

    expect(response.body).toMatchObject({ repaymentIncidents: 1, proposedOutcome: 'refuse' });
  });

  it('refuses the assessment without a published scoring model version, by its code', async () => {
    const applicationId = await applicationWithAccountsAndRegister();
    const credit = await analyst();

    const response = await credit.post(`/applications/${applicationId}/assessment`, {});

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toMatchObject({ code: 'NO_SCORE_AVAILABLE' });
  });

  it('refuses the assessment of an application whose account information is not read, by its code', async () => {
    const { applicationId } = await submittedApplication();
    const operator = await creditScoringOperatorOf(application, 'olivia');

    expectStatus(await operator.post('/scoring-models', version), 201);

    const credit = await analyst();
    const response = await credit.post(`/applications/${applicationId}/assessment`, {});

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toMatchObject({ code: 'MISSING_ACCOUNT_INFORMATION' });
  });
});
