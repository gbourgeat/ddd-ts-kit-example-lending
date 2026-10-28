import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { BANK_TENANT, openBank } from '$test/e2e/support/servicing/bank';
import {
  grantDueInstalmentCollection,
  payOutLoan,
  readLoanAsBorrower,
  runNightlyComputation,
} from '$test/e2e/support/servicing/nightly-run';

/** A loan whose mandate the payer's bank refuses: the simulated provider refuses the mandates prefixed `refused-`. */
const REFUSED_LOAN_ID = 'refused-loan-1';
const ACCEPTED_LOAN_ID = 'loan-1';

/** The nightly run of the tenth of March, when the first two instalments have fallen due. */
const NIGHTLY_RUN_ON_THE_TENTH_OF_MARCH = new Date('2026-03-10T00:00:00.000Z');

describe('Collect each due instalment by direct debit, end to end', () => {
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
    await grantDueInstalmentCollection(application);
  });

  it('records the payment of each instalment noted due, and lets the borrower read it', async () => {
    await payOutLoan(application, ACCEPTED_LOAN_ID);

    await runNightlyComputation(application, NIGHTLY_RUN_ON_THE_TENTH_OF_MARCH);

    expect(await readLoanAsBorrower(application, ACCEPTED_LOAN_ID)).toMatchObject({
      instalmentsDue: [1, 2],
      instalmentsPaid: [1, 2],
      instalmentsUnpaid: [],
    });
  });

  it('marks the instalment unpaid when its direct debit is rejected', async () => {
    await payOutLoan(application, REFUSED_LOAN_ID);

    await runNightlyComputation(application, NIGHTLY_RUN_ON_THE_TENTH_OF_MARCH);

    expect(await readLoanAsBorrower(application, REFUSED_LOAN_ID)).toMatchObject({
      instalmentsDue: [1, 2],
      instalmentsPaid: [],
      instalmentsUnpaid: [1, 2],
    });
  });

  it('does not collect a rejected instalment again when the nightly run is repeated', async () => {
    await payOutLoan(application, REFUSED_LOAN_ID);
    await runNightlyComputation(application, NIGHTLY_RUN_ON_THE_TENTH_OF_MARCH);

    await runNightlyComputation(application, NIGHTLY_RUN_ON_THE_TENTH_OF_MARCH);

    expect(await readLoanAsBorrower(application, REFUSED_LOAN_ID)).toMatchObject({
      instalmentsUnpaid: [1, 2],
      instalmentsPaid: [],
    });
  });

  it('collects each instalment once when the nightly run is repeated the same night', async () => {
    await payOutLoan(application, ACCEPTED_LOAN_ID);
    await runNightlyComputation(application, NIGHTLY_RUN_ON_THE_TENTH_OF_MARCH);

    await runNightlyComputation(application, NIGHTLY_RUN_ON_THE_TENTH_OF_MARCH);

    expect(await readLoanAsBorrower(application, ACCEPTED_LOAN_ID)).toMatchObject({
      instalmentsPaid: [1, 2],
    });
  });
});
