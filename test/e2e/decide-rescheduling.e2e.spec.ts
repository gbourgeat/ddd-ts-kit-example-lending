import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus, type HttpClient } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { analystOf } from '$test/e2e/support/credit-application/assessed-application-world';
import {
  appointStaff,
  deciderOf,
  keepDecisionReads,
  publishDelegationTable,
} from '$test/e2e/support/credit-application/decision-world';
import {
  approvedApplicationAssessedBy,
  approvedApplicationOf,
  refusedApplicationOf,
} from '$test/e2e/support/credit-application/rescheduling-world';

const rescheduling = { durationMonths: 48, outstandingAmountCents: 1_000_000 };

describe('Decide a rescheduling of an approved application, end to end', () => {
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
    const response = await application.client.post('/applications/id-1/rescheduling-decision', rescheduling);

    expectStatus(response, 401);
  });

  it('answers 403 to an actor who does not hold application.reschedule', async () => {
    const stranger: HttpClient = await application.as({ id: 'stranger', tenantId: 'acme-bank' });

    const response = await stranger.post('/applications/id-1/rescheduling-decision', rescheduling);

    expectStatus(response, 403);
  });

  it('records the rescheduling of an approved application within the limit of the decider: 204', async () => {
    const applicationId = await approvedApplicationOf(application);
    const advisor = await deciderOf(application, 'advisor');

    expectStatus(await advisor.post(`/applications/${applicationId}/rescheduling-decision`, rescheduling), 204);
  });

  it('lets a member of staff appointed to the level decide the rescheduling, with no relation written by the spec', async () => {
    const applicationId = await approvedApplicationOf(application);
    const accountId = await appointStaff(application, 'advisor');
    const advisor = await application.as({ id: accountId, tenantId: 'acme-bank' });

    expectStatus(await advisor.post(`/applications/${applicationId}/rescheduling-decision`, rescheduling), 204);
  });

  it('refuses an outstanding amount above the limit of the decider, with the level it needs', async () => {
    const applicationId = await approvedApplicationOf(application);
    const advisor = await deciderOf(application, 'advisor');
    const aboveLimit = { durationMonths: 48, outstandingAmountCents: 2_000_000 };

    const response = await advisor.post(`/applications/${applicationId}/rescheduling-decision`, aboveLimit);

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toMatchObject({ code: 'DECISION_ABOVE_LIMIT', facts: { levelNeeded: 'credit-analyst' } });
  });

  it('refuses the rescheduling by the person who prepared the file, by its code', async () => {
    const assessorId = await appointStaff(application, 'credit-analyst');
    const applicationId = await approvedApplicationAssessedBy(application, assessorId);
    const preparer = await analystOf(application, assessorId);

    const response = await preparer.post(`/applications/${applicationId}/rescheduling-decision`, rescheduling);

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toMatchObject({ code: 'PREPARER_CANNOT_DECIDE' });
  });

  it('refuses a duration that is not a positive whole number of months, by its code', async () => {
    const applicationId = await approvedApplicationOf(application);
    const advisor = await deciderOf(application, 'advisor');
    const noMonths = { durationMonths: 0, outstandingAmountCents: 1_000_000 };

    const response = await advisor.post(`/applications/${applicationId}/rescheduling-decision`, noMonths);

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toMatchObject({ code: 'INVALID_DURATION' });
  });

  // Last: the refused application lists its applicant in the register, which the reset does not empty.
  it('refuses the rescheduling of an application that is not approved, by its code', async () => {
    const applicationId = await refusedApplicationOf(application);
    const advisor = await deciderOf(application, 'advisor');

    const response = await advisor.post(`/applications/${applicationId}/rescheduling-decision`, rescheduling);

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toMatchObject({ code: 'RESCHEDULING_NOT_APPROVED' });
  });
});
