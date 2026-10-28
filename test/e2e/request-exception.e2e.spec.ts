import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus, type HttpClient } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { analystOf, submittedApplication } from '$test/e2e/support/credit-application/assessed-application-world';
import {
  appointStaff,
  assessedApplicationBy,
  deciderOf,
  keepDecisionReads,
  publishDelegationTable,
} from '$test/e2e/support/credit-application/decision-world';

const justified = { justification: 'The applicant has a stable salary and a guarantor.' };

/** The advisor limit of the table published here: the application asks for 12,345.67 euros, above it. */
const ADVISOR_LIMIT_CENTS = 500_000;

describe('Request an exception to the policy, end to end', () => {
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
  });

  it('answers 401 to a caller who presents no credential', async () => {
    const response = await application.client.post('/applications/id-1/exceptions', justified);

    expectStatus(response, 401);
  });

  it('answers 403 to an actor who does not hold application.request-exception', async () => {
    const stranger: HttpClient = await application.as({ id: 'stranger', tenantId: 'acme-bank' });

    const response = await stranger.post('/applications/id-1/exceptions', justified);

    expectStatus(response, 403);
  });

  it('records the exception of a decider whose limit is below the amount: 204', async () => {
    await publishDelegationTable(application, ADVISOR_LIMIT_CENTS);
    const applicationId = await assessedBy();
    const advisor = await deciderOf(application, 'advisor');

    expectStatus(await advisor.post(`/applications/${applicationId}/exceptions`, justified), 204);
  });

  it('lets the account of a member of staff ask once appointed, with no relation written by the spec', async () => {
    await publishDelegationTable(application, ADVISOR_LIMIT_CENTS);
    const applicationId = await assessedBy();
    const accountId = await appointStaff(application, 'advisor');
    const advisor = await application.as({ id: accountId, tenantId: 'acme-bank' });

    expectStatus(await advisor.post(`/applications/${applicationId}/exceptions`, justified), 204);
  });

  it('refuses an exception the limit of the decider already covers, by its code', async () => {
    await publishDelegationTable(application);
    const applicationId = await assessedBy();
    const advisor = await deciderOf(application, 'advisor');

    const response = await advisor.post(`/applications/${applicationId}/exceptions`, justified);

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toMatchObject({ code: 'EXCEPTION_NOT_ABOVE_LIMIT' });
  });

  it('refuses a second exception while one is already requested on the application, by its code', async () => {
    await publishDelegationTable(application, ADVISOR_LIMIT_CENTS);
    const applicationId = await assessedBy();
    const advisor = await deciderOf(application, 'advisor');

    expectStatus(await advisor.post(`/applications/${applicationId}/exceptions`, justified), 204);

    const response = await advisor.post(`/applications/${applicationId}/exceptions`, justified);

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toMatchObject({ code: 'EXCEPTION_ALREADY_REQUESTED' });
  });

  it('refuses an exception without its justification in words, by its code', async () => {
    await publishDelegationTable(application, ADVISOR_LIMIT_CENTS);
    const applicationId = await assessedBy();
    const advisor = await deciderOf(application, 'advisor');

    const response = await advisor.post(`/applications/${applicationId}/exceptions`, { justification: '   ' });

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toMatchObject({ code: 'INVALID_EXCEPTION_JUSTIFICATION' });
  });

  it('refuses an exception on an application not assessed, by its code', async () => {
    await publishDelegationTable(application, ADVISOR_LIMIT_CENTS);
    const { applicationId } = await submittedApplication(application);
    const advisor = await deciderOf(application, 'advisor');

    const response = await advisor.post(`/applications/${applicationId}/exceptions`, justified);

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toMatchObject({ code: 'NOT_ASSESSED' });
  });

  it('refuses the exception asked by the person who prepared the file, by its code', async () => {
    await publishDelegationTable(application, ADVISOR_LIMIT_CENTS);
    const assessorId = await appointStaff(application, 'credit-analyst');
    const applicationId = await assessedApplicationBy(application, false, assessorId);
    const preparer = await analystOf(application, assessorId);

    const response = await preparer.post(`/applications/${applicationId}/exceptions`, justified);

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toMatchObject({ code: 'PREPARER_CANNOT_DECIDE' });
  });

  it('refuses an operator who was never appointed to a level, 403', async () => {
    await publishDelegationTable(application, ADVISOR_LIMIT_CENTS);
    const applicationId = await assessedBy();
    const operator = await analystOf(application, 'no-level-operator');

    expectStatus(await operator.post(`/applications/${applicationId}/exceptions`, justified), 403);
  });

  /** An application assessed by a credit analyst, who is not the decider of the test. */
  async function assessedBy(): Promise<string> {
    return assessedApplicationBy(application, false, await appointStaff(application, 'credit-analyst'));
  }
});
