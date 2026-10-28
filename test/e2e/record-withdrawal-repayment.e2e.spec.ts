import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { operatorOf, registeredCustomer } from '$test/e2e/support/customer-due-diligence/customer-files';
import { storedEventsText } from '$test/e2e/support/servicing/paid-out-loan';
import { borrowerOf, publishPayoutAuthorised } from '$test/e2e/support/servicing/payout-authorised';
import { publishWithdrawn } from '$test/e2e/support/servicing/publish-withdrawn';

const TIMERS_KEPT_REAL = [
  'setTimeout',
  'clearTimeout',
  'setInterval',
  'clearInterval',
  'setImmediate',
  'clearImmediate',
  'nextTick',
  'queueMicrotask',
] as const;

const APPLICATION_ID = 'application-1';
const PAID_OUT_AT = new Date('2026-03-01T00:00:00.000Z');
const WITHDRAWN_AT = new Date('2026-03-31T00:00:00.000Z');
const CAPITAL_CENTS = 100_000;
// 1 000 euros at 5 percent over the 30 days from the payout: 100000 * 500 * 30 / (10000 * 365), rounded down.
const INTEREST_CENTS = 410;

// No route starts "record withdrawal repayment": the integration handler sends its command when credit-application publishes the withdrawal.
describe('Record withdrawal repayment, end to end', () => {
  let application: RunningApplication;
  let customerId: string;

  beforeAll(async () => {
    application = await startApplication();
  });

  afterAll(async () => {
    jest.useRealTimers();
    await application.close();
  });

  beforeEach(async () => {
    await application.reset();

    customerId = await registeredCustomer(await operatorOf(application, 'ada'));
  });

  it('closes the loan of the application on the withdrawal, and lets its borrower read it as closed', async () => {
    await payOut();
    await withdrawOn(WITHDRAWN_AT);
    const borrower = await borrowerOf(application, 'bob', APPLICATION_ID);

    const response = await borrower.get(`/loans/${APPLICATION_ID}`);

    expectStatus(response, 200);
    expect(response.body).toMatchObject({ loanId: APPLICATION_ID, status: 'closed' });
  });

  it('records the capital as paid out and the interest accrued from the payout to the withdrawal', async () => {
    await payOut();
    await withdrawOn(WITHDRAWN_AT);

    const stored = await storedEventsText(application);

    expect(stored).toContain(`"capitalCents":${CAPITAL_CENTS}`);
    expect(stored).toContain(`"interestCents":${INTEREST_CENTS}`);
  });

  it('records the repayment once when the same withdrawal is delivered again', async () => {
    await payOut();
    await withdrawOn(WITHDRAWN_AT);
    await withdrawOn(WITHDRAWN_AT);

    const repayments =
      (await storedEventsText(application)).split('servicing.loan.withdrawal-repayment-recorded').length - 1;

    expect(repayments).toBe(1);
  });

  it('records no repayment when the withdrawal comes before the payout: no loan exists yet', async () => {
    await withdrawOn(WITHDRAWN_AT);

    expect(await storedEventsText(application)).not.toContain('servicing.loan.withdrawal-repayment-recorded');
  });

  /** Pays the application out on the payout instant, the clock of the platform being the one the test moves. */
  async function payOut(): Promise<void> {
    jest.useFakeTimers({ now: PAID_OUT_AT, doNotFake: [...TIMERS_KEPT_REAL] });

    await publishPayoutAuthorised(application, {
      applicationId: APPLICATION_ID,
      customerId,
      occurredAt: PAID_OUT_AT.toISOString(),
    });
  }

  /** Publishes the withdrawal of the application at the instant `at`, the clock of the platform reading `at`. */
  async function withdrawOn(at: Date): Promise<void> {
    jest.useFakeTimers({ now: at, doNotFake: [...TIMERS_KEPT_REAL] });
    await publishWithdrawn(application, { applicationId: APPLICATION_ID, occurredAt: at.toISOString() });
  }
});
