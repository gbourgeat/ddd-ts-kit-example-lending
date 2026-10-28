import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { servicingOperatorAt } from '$test/e2e/support/servicing/loan-retention';
import { storePaidOutLoan, storedEventsText } from '$test/e2e/support/servicing/paid-out-loan';

const LOAN_ID = 'loan-1';
/** The loan is paid out on the tenth of January 2026. */
const PAID_OUT_ON = new Date('2026-01-10T00:00:00.000Z');
/** A year after the payout: a loan of two years then has exactly one year left. */
const ONE_YEAR_AFTER_PAYOUT = new Date('2027-01-10T00:00:00.000Z');
const CAPITAL_CENTS = 100_000;

describe('Early repayment fee, end to end', () => {
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

  afterEach(() => {
    jest.useRealTimers();
  });

  it('charges 1 percent of the capital repaid when more than a year of the schedule remains', async () => {
    await storePaidOutLoan(application, LOAN_ID, PAID_OUT_ON, 24);

    await repay(application, PAID_OUT_ON, CAPITAL_CENTS);

    expect(await storedEventsText(application)).toContain('"feeCents":1000');
  });

  it('charges 0.5 percent of the capital repaid when exactly a year of the schedule remains', async () => {
    await storePaidOutLoan(application, LOAN_ID, PAID_OUT_ON, 12);

    await repay(application, PAID_OUT_ON, CAPITAL_CENTS);

    expect(await storedEventsText(application)).toContain('"feeCents":500');
  });

  it('charges 0.5 percent of the capital repaid when a loan of two years has one year left', async () => {
    await storePaidOutLoan(application, LOAN_ID, PAID_OUT_ON, 24);

    await repay(application, ONE_YEAR_AFTER_PAYOUT, CAPITAL_CENTS);

    expect(await storedEventsText(application)).toContain('"feeCents":500');
  });

  it('rounds the fee down to the whole cent', async () => {
    await storePaidOutLoan(application, LOAN_ID, PAID_OUT_ON, 12);

    await repay(application, PAID_OUT_ON, 12_345);

    expect(await storedEventsText(application)).toContain('"feeCents":61');
  });
});

/** Repays `capitalCents` of the loan as an operator of servicing at the instant `now`, and expects it accepted. */
async function repay(app: RunningApplication, now: Date, capitalCents: number): Promise<void> {
  const ada = await servicingOperatorAt(app, 'ada', now);

  expectStatus(await ada.post(`/loans/${LOAN_ID}/early-repayments`, { capitalCents }), 204);
}
