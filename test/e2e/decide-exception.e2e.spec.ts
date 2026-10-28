import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { analystOf } from '$test/e2e/support/credit-application/assessed-application-world';
import {
  appointStaff,
  assessedApplicationBy,
  deciderOf,
  keepDecisionReads,
  publishDelegationTable,
} from '$test/e2e/support/credit-application/decision-world';

const justified = { justification: 'The applicant has a stable salary and a guarantor.' };
const approvedException = { outcome: 'approve', reasons: 'The guarantor covers the excess.' };
const refusedException = { outcome: 'refuse', reasons: 'The guarantor does not cover the excess.' };
const approval = { outcome: 'approve', reasons: '', conditions: '', approvedAmountCents: 0 };

/** The advisor limit of the table published here: the application asks for 12,345.67 euros, above it. */
const ADVISOR_LIMIT_CENTS = 500_000;

describe('Decide an exception to the policy, end to end', () => {
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
    const response = await application.client.post('/applications/id-1/exception-decision', approvedException);

    expectStatus(response, 401);
  });

  it('answers 403 to an actor who does not hold exception.decide', async () => {
    const stranger = await application.as({ id: 'stranger', tenantId: 'acme-bank' });

    expectStatus(await stranger.post('/applications/id-1/exception-decision', approvedException), 403);
  });

  it('lets the committee approve the exception: 204, and the requester then decides above the limit: 201', async () => {
    await publishDelegationTable(application, ADVISOR_LIMIT_CENTS);
    const applicationId = await assessedBy();
    const advisor = await deciderOf(application, 'advisor');
    const committee = await deciderOf(application, 'credit-committee');

    expectStatus(await advisor.post(`/applications/${applicationId}/exceptions`, justified), 204);
    expectStatus(await committee.post(`/applications/${applicationId}/exception-decision`, approvedException), 204);
    expectStatus(await advisor.post(`/applications/${applicationId}/decision`, approval), 201);
  });

  it('keeps the limit when the committee refuses the exception: the decision above the limit is refused', async () => {
    await publishDelegationTable(application, ADVISOR_LIMIT_CENTS);
    const applicationId = await assessedBy();
    const advisor = await deciderOf(application, 'advisor');
    const committee = await deciderOf(application, 'credit-committee');

    expectStatus(await advisor.post(`/applications/${applicationId}/exceptions`, justified), 204);
    expectStatus(await committee.post(`/applications/${applicationId}/exception-decision`, refusedException), 204);

    const response = await advisor.post(`/applications/${applicationId}/decision`, approval);

    expect(response.body).toMatchObject({ code: 'DECISION_ABOVE_LIMIT' });
  });

  it('refuses a decider who is not of the credit committee, by its code', async () => {
    await publishDelegationTable(application, ADVISOR_LIMIT_CENTS);
    const applicationId = await assessedBy();
    const advisor = await deciderOf(application, 'advisor');

    expectStatus(await advisor.post(`/applications/${applicationId}/exceptions`, justified), 204);

    const response = await advisor.post(`/applications/${applicationId}/exception-decision`, approvedException);

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toMatchObject({ code: 'NOT_CREDIT_COMMITTEE' });
  });

  it('refuses the exception decided by the person who prepared the file, by its code', async () => {
    await publishDelegationTable(application, ADVISOR_LIMIT_CENTS);
    const assessorId = await appointStaff(application, 'credit-committee');
    const applicationId = await assessedApplicationBy(application, false, assessorId);
    const advisor = await deciderOf(application, 'advisor');

    expectStatus(await advisor.post(`/applications/${applicationId}/exceptions`, justified), 204);

    const preparer = await analystOf(application, assessorId);
    const response = await preparer.post(`/applications/${applicationId}/exception-decision`, approvedException);

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toMatchObject({ code: 'PREPARER_CANNOT_DECIDE' });
  });

  it('refuses an exception decided when none is requested, by its code', async () => {
    await publishDelegationTable(application, ADVISOR_LIMIT_CENTS);
    const applicationId = await assessedBy();
    const committee = await deciderOf(application, 'credit-committee');

    const response = await committee.post(`/applications/${applicationId}/exception-decision`, approvedException);

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toMatchObject({ code: 'NO_EXCEPTION_REQUESTED' });
  });

  it('refuses a second decision on the same exception, by its code', async () => {
    await publishDelegationTable(application, ADVISOR_LIMIT_CENTS);
    const applicationId = await assessedBy();
    const advisor = await deciderOf(application, 'advisor');
    const committee = await deciderOf(application, 'credit-committee');

    expectStatus(await advisor.post(`/applications/${applicationId}/exceptions`, justified), 204);
    expectStatus(await committee.post(`/applications/${applicationId}/exception-decision`, approvedException), 204);

    const response = await committee.post(`/applications/${applicationId}/exception-decision`, approvedException);

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toMatchObject({ code: 'EXCEPTION_ALREADY_DECIDED' });
  });

  it('refuses an exception decided without its reasons in words, by its code', async () => {
    await publishDelegationTable(application, ADVISOR_LIMIT_CENTS);
    const applicationId = await assessedBy();
    const advisor = await deciderOf(application, 'advisor');
    const committee = await deciderOf(application, 'credit-committee');

    expectStatus(await advisor.post(`/applications/${applicationId}/exceptions`, justified), 204);

    const response = await committee.post(`/applications/${applicationId}/exception-decision`, {
      outcome: 'refuse',
      reasons: '   ',
    });

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toMatchObject({ code: 'INVALID_DECISION_REASONS' });
  });

  /** An application assessed by a credit analyst, who is not the decider of the test. */
  async function assessedBy(): Promise<string> {
    return assessedApplicationBy(application, false, await appointStaff(application, 'credit-analyst'));
  }
});
