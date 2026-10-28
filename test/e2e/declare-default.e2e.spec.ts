import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { BANK_TENANT, openBank } from '$test/e2e/support/servicing/bank';
import { payOutLoan, readLoanAsBorrower, runNightlyComputation } from '$test/e2e/support/servicing/nightly-run';
import { servicingOperatorAt } from '$test/e2e/support/servicing/loan-retention';
import { expectJobAuditedFor } from '$test/e2e/support/job-audit';

/** A loan whose mandate the payer's bank refuses: the simulated provider refuses the mandates prefixed `refused-`. */
const REFUSED_LOAN_ID = 'refused-loan-1';

/** The job that declares in default each open loan of the bank 90 days past due, by its name in the application. */
const DECLARE_JOB = 'servicing.declare-default';

/** The instant the first instalment of the loans of this spec falls due: the tenth of February. */
const FIRST_INSTALMENT_DUE_ON = new Date('2026-02-10T00:00:00.000Z');

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

describe('Default at 90 days past due and hand over to collections, end to end', () => {
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

  it('does not declare in default a loan 10 days past due', async () => {
    await payOutLoan(application, REFUSED_LOAN_ID);
    await runNightlyComputation(application, FIRST_INSTALMENT_DUE_ON);

    await runDeclaration(application, daysAfter(FIRST_INSTALMENT_DUE_ON, 10));

    expect(await readLoanAsBorrower(application, REFUSED_LOAN_ID)).toMatchObject({ defaulted: false });
  });

  it('does not declare in default a loan 70 days past due', async () => {
    await payOutLoan(application, REFUSED_LOAN_ID);
    await runNightlyComputation(application, FIRST_INSTALMENT_DUE_ON);

    await runDeclaration(application, daysAfter(FIRST_INSTALMENT_DUE_ON, 70));

    expect(await readLoanAsBorrower(application, REFUSED_LOAN_ID)).toMatchObject({ defaulted: false });
  });

  it('declares in default a loan 100 days past due, handed to collections', async () => {
    await payOutLoan(application, REFUSED_LOAN_ID);
    await runNightlyComputation(application, FIRST_INSTALMENT_DUE_ON);

    await runDeclaration(application, daysAfter(FIRST_INSTALMENT_DUE_ON, 100));

    expect(await readLoanAsBorrower(application, REFUSED_LOAN_ID)).toMatchObject({ defaulted: true });
  });

  it('keeps the default when the declaration runs again', async () => {
    await payOutLoan(application, REFUSED_LOAN_ID);
    await runNightlyComputation(application, FIRST_INSTALMENT_DUE_ON);
    await runDeclaration(application, daysAfter(FIRST_INSTALMENT_DUE_ON, 100));

    await runDeclaration(application, daysAfter(FIRST_INSTALMENT_DUE_ON, 100));

    expect(await readLoanAsBorrower(application, REFUSED_LOAN_ID)).toMatchObject({ defaulted: true });
  });

  it('is audited as the declaration job of the bank', async () => {
    await payOutLoan(application, REFUSED_LOAN_ID);
    await runNightlyComputation(application, FIRST_INSTALMENT_DUE_ON);

    await runDeclaration(application, daysAfter(FIRST_INSTALMENT_DUE_ON, 100));

    await expectJobAuditedFor(application, DECLARE_JOB, BANK_TENANT);
  });
});

/** The instant a number of days after another one. */
function daysAfter(instant: Date, days: number): Date {
  return new Date(instant.getTime() + days * MILLISECONDS_PER_DAY);
}

/** Runs the default declaration of the bank on the day it is scheduled for, and settles the work it starts. */
async function runDeclaration(app: RunningApplication, on: Date): Promise<void> {
  await servicingOperatorAt(app, 'ada', on);

  await app.runJob(DECLARE_JOB);
  await app.settled();
}
