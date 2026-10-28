import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { analystOf } from '$test/e2e/support/credit-application/assessed-application-world';
import {
  appointStaff,
  assessedApplicationOfCustomer,
  declareConflictAs,
  deciderOf,
  keepDecisionReads,
  publishDelegationTable,
} from '$test/e2e/support/credit-application/decision-world';

const approval = { outcome: 'approve', reasons: '', conditions: '', approvedAmountCents: 0 };
const conflictedAccount = 'conflicted-analyst';

describe('Decide an application as a member of staff who declared a conflict on the applicant, end to end', () => {
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

  it('refuses the decision of the member of staff who declared a conflict on the applicant, by its code', async () => {
    await publishDelegationTable(application);
    const assessorId = await appointStaff(application, 'credit-analyst');
    const { applicationId, customerId } = await assessedApplicationOfCustomer(application, assessorId);
    const conflictedId = await appointStaff(application, 'credit-analyst', conflictedAccount);

    await declareConflictAs(application, conflictedAccount, customerId);

    const conflicted = await analystOf(application, conflictedId);
    const response = await conflicted.post(`/applications/${applicationId}/decision`, approval);

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toMatchObject({ code: 'CONFLICTED_DECIDER' });
  });

  it('records no decision on the refusal: a decider with no conflict decides the same application afterwards', async () => {
    await publishDelegationTable(application);
    const assessorId = await appointStaff(application, 'credit-analyst');
    const { applicationId, customerId } = await assessedApplicationOfCustomer(application, assessorId);
    const conflictedId = await appointStaff(application, 'credit-analyst', conflictedAccount);

    await declareConflictAs(application, conflictedAccount, customerId);

    const conflicted = await analystOf(application, conflictedId);

    expect(await conflicted.post(`/applications/${applicationId}/decision`, approval)).toMatchObject({
      body: { code: 'CONFLICTED_DECIDER' },
    });

    const committee = await deciderOf(application, 'credit-committee');

    expectStatus(await committee.post(`/applications/${applicationId}/decision`, approval), 201);
  });
});
