import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { BANK_TENANT, openBank } from '$test/e2e/support/servicing/bank';
import { payOutLoan, readLoanAsBorrower, runNightlyComputation } from '$test/e2e/support/servicing/nightly-run';
import { servicingOperator, storedEventsText } from '$test/e2e/support/servicing/paid-out-loan';

/** A loan whose mandate the payer's bank refuses: its direct debits are rejected, one after the other. */
const REFUSED_LOAN_ID = 'refused-loan-1';
const ACCEPTED_LOAN_ID = 'loan-1';

/** The nightly runs of the tenth of February and of the tenth of March: the first, then the second instalment falls due. */
const FIRST_NIGHTLY_RUN = new Date('2026-02-10T00:00:00.000Z');
const SECOND_NIGHTLY_RUN = new Date('2026-03-10T00:00:00.000Z');

/** The event the declaration records in the ledger of the loan: its stored name. */
const DECLARED_EVENT = 'servicing.loan.repayment-incident-declared';

describe('Declare a repayment incident after two consecutive unpaid instalments, end to end', () => {
  let application: RunningApplication;

  beforeAll(async () => {
    application = await startApplication();
  });

  afterAll(async () => {
    await application.close();
  });

  beforeEach(async () => {
    await application.reset();
    await openBank(application, BANK_TENANT);
  });

  it('shows the loan as declared once its two consecutive instalments are unpaid', async () => {
    await payOutLoan(application, REFUSED_LOAN_ID);
    await runNightlyComputation(application, FIRST_NIGHTLY_RUN);
    await runNightlyComputation(application, SECOND_NIGHTLY_RUN);

    expect(await readLoanAsBorrower(application, REFUSED_LOAN_ID)).toMatchObject({ incidentDeclared: true });
  });

  it('records the declaration once, though the nightly run is repeated after the second instalment', async () => {
    await payOutLoan(application, REFUSED_LOAN_ID);
    await runNightlyComputation(application, FIRST_NIGHTLY_RUN);
    await runNightlyComputation(application, SECOND_NIGHTLY_RUN);

    await runNightlyComputation(application, SECOND_NIGHTLY_RUN);

    expect(occurrencesOf(DECLARED_EVENT, await storedEventsText(application))).toBe(1);
  });

  it('withdraws the declaration once the unpaid instalments are paid late through the route', async () => {
    await payOutLoan(application, REFUSED_LOAN_ID);
    await runNightlyComputation(application, FIRST_NIGHTLY_RUN);
    await runNightlyComputation(application, SECOND_NIGHTLY_RUN);
    const operator = await servicingOperator(application, 'ops');

    expectStatus(await operator.post(`/loans/${REFUSED_LOAN_ID}/instalments/1/payments`, { amountCents: 8_560 }), 204);
    expectStatus(await operator.post(`/loans/${REFUSED_LOAN_ID}/instalments/2/payments`, { amountCents: 8_560 }), 204);
    await application.settled();

    expect(await readLoanAsBorrower(application, REFUSED_LOAN_ID)).toMatchObject({
      incidentDeclared: false,
      instalmentsUnpaid: [1, 2],
      instalmentsPaid: [1, 2],
    });
  });

  it('does not declare the loan while a single instalment is unpaid', async () => {
    await payOutLoan(application, REFUSED_LOAN_ID);

    await runNightlyComputation(application, FIRST_NIGHTLY_RUN);

    expect(await readLoanAsBorrower(application, REFUSED_LOAN_ID)).toMatchObject({ incidentDeclared: false });
  });

  it('does not declare a loan whose direct debits are all accepted', async () => {
    await payOutLoan(application, ACCEPTED_LOAN_ID);
    await runNightlyComputation(application, FIRST_NIGHTLY_RUN);
    await runNightlyComputation(application, SECOND_NIGHTLY_RUN);

    expect(await readLoanAsBorrower(application, ACCEPTED_LOAN_ID)).toMatchObject({ incidentDeclared: false });
  });
});

/** How many times a text holds the given word: the events of the stored ledger carry each name once. */
function occurrencesOf(word: string, text: string): number {
  return text.split(word).length - 1;
}
