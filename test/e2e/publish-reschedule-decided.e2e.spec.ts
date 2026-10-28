import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { collectEvents, expectStatus } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import {
  deciderOf,
  keepDecisionReads,
  publishDelegationTable,
} from '$test/e2e/support/credit-application/decision-world';
import { storePaidOutLoan } from '$test/e2e/support/servicing/paid-out-loan';
import { approvedApplicationOf } from '$test/e2e/support/credit-application/rescheduling-world';

const rescheduleDecided = 'credit-application.credit-application.reschedule-decided';

describe('Publish the rescheduling decided for servicing, end to end', () => {
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

  it('publishes the new duration and the outstanding capital of the application rescheduled', async () => {
    const received = collectEvents(application.events, [rescheduleDecided]);
    const applicationId = await approvedApplicationOf(application);

    // Servicing reschedules the loan of the application: it exists, paid out under the identifier of the application.
    await storePaidOutLoan(application, applicationId, new Date('2026-01-10T00:00:00.000Z'));
    const advisor = await deciderOf(application, 'advisor');

    expectStatus(
      await advisor.post(`/applications/${applicationId}/rescheduling-decision`, {
        durationMonths: 48,
        outstandingAmountCents: 1_000_000,
      }),
      204,
    );

    await application.settled();
    received.stop();

    expect(received.received(rescheduleDecided).map((event) => event.payload)).toEqual([
      { creditApplicationId: applicationId, durationMonths: 48, outstandingAmountCents: 1_000_000 },
    ]);
  });
});
