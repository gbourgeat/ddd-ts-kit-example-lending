import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { analystOf } from '$test/e2e/support/credit-application/assessed-application-world';
import {
  appointStaff,
  assessedApplicationBy,
  confirmRefusal,
  deciderOf,
  keepDecisionReads,
  publishDelegationTable,
} from '$test/e2e/support/credit-application/decision-world';

const approval = { outcome: 'approve', reasons: '', conditions: '', approvedAmountCents: 0 };
const refusal = { outcome: 'refuse', reasons: 'Confirmed by the review.', conditions: '', approvedAmountCents: 0 };

describe('Decide an application within the limits of the deciders, end to end', () => {
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

  it('refuses an amount above the limit of the decider, with the level it needs', async () => {
    await publishDelegationTable(application, 500_000);

    const applicationId = await assessedApplicationBy(
      application,
      false,
      await appointStaff(application, 'credit-analyst'),
    );

    const advisor = await deciderOf(application, 'advisor');

    const response = await advisor.post(`/applications/${applicationId}/decision`, approval);

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toMatchObject({ code: 'DECISION_ABOVE_LIMIT', facts: { levelNeeded: 'credit-analyst' } });
  });

  it('records the decision of a credit committee above every limit: 201', async () => {
    await publishDelegationTable(application, 500_000);

    const applicationId = await assessedApplicationBy(
      application,
      false,
      await appointStaff(application, 'credit-analyst'),
    );

    const committee = await deciderOf(application, 'credit-committee');

    expectStatus(await committee.post(`/applications/${applicationId}/decision`, approval), 201);
  });

  it('refuses the decision of the person who prepared the file, by its code', async () => {
    await publishDelegationTable(application);
    const assessorId = await appointStaff(application, 'credit-analyst');
    const applicationId = await assessedApplicationBy(application, false, assessorId);
    const preparer = await analystOf(application, assessorId);

    const response = await preparer.post(`/applications/${applicationId}/decision`, approval);

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toMatchObject({ code: 'PREPARER_CANNOT_DECIDE' });
  });

  it('refuses the decision of the person who reviewed the refusal, by its code', async () => {
    await publishDelegationTable(application);

    const applicationId = await assessedApplicationBy(
      application,
      true,
      await appointStaff(application, 'credit-analyst'),
    );

    const reviewerId = await appointStaff(application, 'credit-analyst');

    await confirmRefusal(application, applicationId, reviewerId);
    const preparer = await analystOf(application, reviewerId);

    const response = await preparer.post(`/applications/${applicationId}/decision`, refusal);

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toMatchObject({ code: 'PREPARER_CANNOT_DECIDE' });
  });
});
