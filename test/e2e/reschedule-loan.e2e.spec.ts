import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { operatorOf, registeredCustomer } from '$test/e2e/support/customer-due-diligence/customer-files';
import { storedEventsText } from '$test/e2e/support/servicing/paid-out-loan';
import { borrowerOf, publishPayoutAuthorised } from '$test/e2e/support/servicing/payout-authorised';
import { publishRescheduleDecided } from '$test/e2e/support/servicing/publish-reschedule-decided';

const APPLICATION_ID = 'application-1';
const PRINCIPAL_CENTS = 100_000;
const RESCHEDULED_CAPITAL_CENTS = 80_000;
const NEW_DURATION_MONTHS = 6;

const DECISION = {
  eventId: 'reschedule-1',
  applicationId: APPLICATION_ID,
  durationMonths: NEW_DURATION_MONTHS,
  outstandingAmountCents: RESCHEDULED_CAPITAL_CENTS,
};

// No route starts "reschedule loan": the integration handler sends its command when credit-application decides the rescheduling.
describe('Reschedule loan, end to end', () => {
  let application: RunningApplication;
  let customerId: string;

  beforeAll(async () => {
    application = await startApplication();
  });

  afterAll(async () => {
    await application.close();
  });

  beforeEach(async () => {
    await application.reset();

    customerId = await registeredCustomer(await operatorOf(application, 'ada'));
    await publishPayoutAuthorised(application, { applicationId: APPLICATION_ID, customerId });
  });

  it('gives the loan the instalments of the outstanding capital over the new duration, and lets its borrower read them', async () => {
    await publishRescheduleDecided(application, DECISION);
    const borrower = await borrowerOf(application, 'bob', APPLICATION_ID);

    const response = await borrower.get(`/loans/${APPLICATION_ID}`);

    expectStatus(response, 200);

    expect(response.body).toMatchObject({
      loanId: APPLICATION_ID,
      status: 'paid-out',
      durationMonths: NEW_DURATION_MONTHS,
      annualRateBasisPoints: 500,
    });

    expect((response.body as { instalmentsCents: number[] }).instalmentsCents).toHaveLength(NEW_DURATION_MONTHS);
  });

  it('keeps the amount paid out of the loan, and the earlier schedule stays in its stored ledger', async () => {
    await publishRescheduleDecided(application, DECISION);
    const borrower = await borrowerOf(application, 'bob', APPLICATION_ID);

    const response = await borrower.get(`/loans/${APPLICATION_ID}`);

    expect(response.body).toMatchObject({ principalCents: PRINCIPAL_CENTS });
    expect(await storedEventsText(application)).toContain('servicing.loan.scheduled');
  });

  it('records the rescheduling once when the same decision is delivered again', async () => {
    await publishRescheduleDecided(application, DECISION);
    await publishRescheduleDecided(application, DECISION);

    const rescheduledEvents = (await storedEventsText(application)).split('servicing.loan.rescheduled').length - 1;

    expect(rescheduledEvents).toBe(1);
  });
});
