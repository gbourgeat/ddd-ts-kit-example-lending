import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus, type HttpClient } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { analystOf, submittedApplication } from '$test/e2e/support/credit-application/assessed-application-world';
import {
  appointStaff,
  assessedApplicationBy,
  confirmRefusal,
  deciderOf,
  keepDecisionReads,
  publishDelegationTable,
} from '$test/e2e/support/credit-application/decision-world';

const approval = { outcome: 'approve', reasons: '', conditions: '', approvedAmountCents: 0 };

const refusal = {
  outcome: 'refuse',
  reasons: 'The debt to income ratio is above the policy.',
  conditions: '',
  approvedAmountCents: 0,
};

const conditional = {
  outcome: 'approve-with-conditions',
  reasons: '',
  conditions: 'A guarantor, and 48 months.',
  approvedAmountCents: 1_000_000,
};

describe('Decide an application, end to end', () => {
  let application: RunningApplication;

  beforeAll(async () => {
    application = await startApplication();
  });

  afterAll(async () => {
    await application.close();
  });

  beforeEach(async () => {
    await application.reset();
    await keepDecisionReads(application);
    await publishDelegationTable(application);
  });

  it('answers 401 to a caller who presents no credential', async () => {
    const response = await application.client.post('/applications/id-1/decision', approval);

    expectStatus(response, 401);
  });

  it('answers 403 to an actor who does not hold application.decide', async () => {
    const stranger: HttpClient = await application.as({ id: 'stranger', tenantId: 'acme-bank' });

    const response = await stranger.post('/applications/id-1/decision', approval);

    expectStatus(response, 403);
  });

  it('records an approval within the limit of the decider: 201', async () => {
    const applicationId = await assessedBy(false);
    const advisor = await deciderOf(application, 'advisor');

    expectStatus(await advisor.post(`/applications/${applicationId}/decision`, approval), 201);
  });

  it('records an approval with conditions, a lower amount and a guarantor in words: 201', async () => {
    const applicationId = await assessedBy(false);
    const advisor = await deciderOf(application, 'advisor');

    expectStatus(await advisor.post(`/applications/${applicationId}/decision`, conditional), 201);
  });

  it('records a refusal with its reasons over an approval proposal: 201', async () => {
    const applicationId = await assessedBy(false);
    const advisor = await deciderOf(application, 'advisor');

    expectStatus(await advisor.post(`/applications/${applicationId}/decision`, refusal), 201);
  });

  it('refuses a refusal without its reasons, by its code', async () => {
    const applicationId = await assessedBy(false);
    const advisor = await deciderOf(application, 'advisor');

    const response = await advisor.post(`/applications/${applicationId}/decision`, { ...refusal, reasons: ' ' });

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toMatchObject({ code: 'INVALID_DECISION_REASONS' });
  });

  it('refuses a second decision on the same application, by its code', async () => {
    const applicationId = await assessedBy(false);
    const advisor = await deciderOf(application, 'advisor');

    expectStatus(await advisor.post(`/applications/${applicationId}/decision`, approval), 201);

    const response = await advisor.post(`/applications/${applicationId}/decision`, refusal);

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toMatchObject({ code: 'ALREADY_DECIDED' });
  });

  it('refuses a decision on an application not assessed, by its code', async () => {
    const { applicationId } = await submittedApplication(application);
    const advisor = await deciderOf(application, 'advisor');

    const response = await advisor.post(`/applications/${applicationId}/decision`, approval);

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toMatchObject({ code: 'NOT_ASSESSED' });
  });

  it('refuses a decision over a proposed refusal not reviewed, by its code', async () => {
    const applicationId = await assessedBy(true);
    const advisor = await deciderOf(application, 'advisor');

    const response = await advisor.post(`/applications/${applicationId}/decision`, refusal);

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toMatchObject({ code: 'REFUSAL_NOT_REVIEWED' });
  });

  it('refuses an approval over a refusal the review confirmed, by its code', async () => {
    const applicationId = await assessedBy(true);

    await confirmRefusal(application, applicationId, await appointStaff(application, 'credit-analyst'));
    const advisor = await deciderOf(application, 'advisor');

    const response = await advisor.post(`/applications/${applicationId}/decision`, approval);

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toMatchObject({ code: 'REFUSAL_PROPOSAL_STANDS' });
  });

  it('records a refusal over a refusal the review confirmed: 201', async () => {
    const applicationId = await assessedBy(true);

    await confirmRefusal(application, applicationId, await appointStaff(application, 'credit-analyst'));
    const advisor = await deciderOf(application, 'advisor');

    expectStatus(await advisor.post(`/applications/${applicationId}/decision`, refusal), 201);
  });

  it('refuses a decider whose level is not known, by its code', async () => {
    const applicationId = await assessedBy(false);
    const stranger = await analystOf(application, 'no-level-operator');

    const response = await stranger.post(`/applications/${applicationId}/decision`, approval);

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toMatchObject({ code: 'UNKNOWN_DECIDER_LEVEL' });
  });

  /** An application assessed by a credit analyst, who is not the decider of the test. */
  async function assessedBy(listed: boolean): Promise<string> {
    return assessedApplicationBy(application, listed, await appointStaff(application, 'credit-analyst'));
  }
});
