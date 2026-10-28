import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { collectEvents, expectStatus } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import {
  appointStaff,
  assessedApplicationBy,
  deciderOf,
  keepDecisionReads,
  publishDelegationTable,
} from '$test/e2e/support/credit-application/decision-world';

const decided = 'credit-application.credit-application.decided';

const refusal = {
  outcome: 'refuse',
  reasons: 'The debt to income ratio is above the policy.',
  conditions: '',
  approvedAmountCents: 0,
};

describe('Publish the decision of an application, end to end', () => {
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

  it('publishes the outcome, the exception flag, the branch and the amount approved to the other contexts', async () => {
    const received = collectEvents(application.events, [decided]);

    const assessorId = await appointStaff(application, 'credit-analyst');
    const applicationId = await assessedApplicationBy(application, false, assessorId);
    const advisor = await deciderOf(application, 'advisor');

    expectStatus(await advisor.post(`/applications/${applicationId}/decision`, refusal), 201);
    await application.settled();
    received.stop();

    const [event] = received.received(decided);

    expect(event?.payload).toMatchObject({
      creditApplicationId: applicationId,
      outcome: 'refuse',
      exception: false,
      approvedAmountCents: 0,
    });
  });
});
