import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { servicingOperatorAt } from '$test/e2e/support/servicing/loan-retention';
import { openBank } from '$test/e2e/support/servicing/bank';
import { storePaidOutLoan, storedEventsText } from '$test/e2e/support/servicing/paid-out-loan';
import { runNightlyComputation } from '$test/e2e/support/servicing/loan-ledger';

const LOAN_ID = 'loan-1';
const PAID_OUT_ON = new Date('2026-01-10T00:00:00.000Z');
/** The nightly run of the tenth of March: the first two instalments of the schedule have fallen due. */
const NIGHTLY_RUN_ON_THE_TENTH_OF_MARCH = new Date('2026-03-10T00:00:00.000Z');
const CAPITAL_CENTS = 100_000;

describe('Early repayment refusals and closure, end to end', () => {
  let application: RunningApplication;

  beforeAll(async () => {
    application = await startApplication();
  });

  afterAll(async () => {
    await application.close();
  });

  beforeEach(async () => {
    await application.reset();
    await openBank(application);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('refuses a repayment above the outstanding capital with EARLY_REPAYMENT_TOO_HIGH', async () => {
    await storePaidOutLoan(application, LOAN_ID, PAID_OUT_ON, 12);
    const ada = await servicingOperatorAt(application, 'ada', PAID_OUT_ON);

    const response = await ada.post(`/loans/${LOAN_ID}/early-repayments`, { capitalCents: CAPITAL_CENTS + 1 });

    expect(response.body).toMatchObject({ code: 'EARLY_REPAYMENT_TOO_HIGH' });
  });

  it('refuses the whole principal once instalments are noted due: their capital is already repaid', async () => {
    await storePaidOutLoan(application, LOAN_ID, PAID_OUT_ON, 12);
    await runNightlyComputation(application, NIGHTLY_RUN_ON_THE_TENTH_OF_MARCH);
    const ada = await servicingOperatorAt(application, 'ada', NIGHTLY_RUN_ON_THE_TENTH_OF_MARCH);

    const response = await ada.post(`/loans/${LOAN_ID}/early-repayments`, { capitalCents: CAPITAL_CENTS });

    expect(response.body).toMatchObject({ code: 'EARLY_REPAYMENT_TOO_HIGH' });
  });

  it('closes the loan when the whole outstanding capital is repaid, in the same ledger', async () => {
    await storePaidOutLoan(application, LOAN_ID, PAID_OUT_ON, 12);
    const ada = await servicingOperatorAt(application, 'ada', PAID_OUT_ON);

    expectStatus(await ada.post(`/loans/${LOAN_ID}/early-repayments`, { capitalCents: CAPITAL_CENTS }), 204);

    expect(await storedEventsText(application)).toContain('servicing.loan.closed');
  });

  it('refuses a repayment of a closed loan with LOAN_ALREADY_CLOSED', async () => {
    await storePaidOutLoan(application, LOAN_ID, PAID_OUT_ON, 12);
    const ada = await servicingOperatorAt(application, 'ada', PAID_OUT_ON);

    expectStatus(await ada.post(`/loans/${LOAN_ID}/early-repayments`, { capitalCents: CAPITAL_CENTS }), 204);

    const response = await ada.post(`/loans/${LOAN_ID}/early-repayments`, { capitalCents: 1 });

    expect(response.body).toMatchObject({ code: 'LOAN_ALREADY_CLOSED' });
  });
});
