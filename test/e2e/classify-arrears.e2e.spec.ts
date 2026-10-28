import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { BANK_TENANT, openBank } from '$test/e2e/support/servicing/bank';
import { payOutLoan, readLoanAsBorrower, runNightlyComputation } from '$test/e2e/support/servicing/nightly-run';
import { servicingOperatorAt } from '$test/e2e/support/servicing/loan-retention';
import { expectJobAuditedFor } from '$test/e2e/support/job-audit';

/** A loan whose mandate the payer's bank refuses: the simulated provider refuses the mandates prefixed `refused-`. */
const REFUSED_LOAN_ID = 'refused-loan-1';
const ACCEPTED_LOAN_ID = 'loan-1';

/** The job that places each open loan of the bank in its arrears bucket each day, by its name in the application. */
const CLASSIFY_JOB = 'servicing.classify-arrears';

/** The instant the first instalment of the loans of this spec falls due: the tenth of February. */
const FIRST_INSTALMENT_DUE_ON = new Date('2026-02-10T00:00:00.000Z');

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

describe('Classify each loan into its arrears bucket each day, end to end', () => {
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

  it('places a loan 10 days past due in the first arrears bucket', async () => {
    await payOutLoan(application, REFUSED_LOAN_ID);
    await runNightlyComputation(application, FIRST_INSTALMENT_DUE_ON);

    await runArrearsClassification(application, daysAfter(FIRST_INSTALMENT_DUE_ON, 10));

    expect(await readLoanAsBorrower(application, REFUSED_LOAN_ID)).toMatchObject({
      arrearsBucket: 'OneToThirtyDays',
    });
  });

  it('places a loan 40 days past due in the second arrears bucket', async () => {
    await payOutLoan(application, REFUSED_LOAN_ID);
    await runNightlyComputation(application, FIRST_INSTALMENT_DUE_ON);

    await runArrearsClassification(application, daysAfter(FIRST_INSTALMENT_DUE_ON, 40));

    expect(await readLoanAsBorrower(application, REFUSED_LOAN_ID)).toMatchObject({
      arrearsBucket: 'ThirtyOneToSixtyDays',
    });
  });

  it('places a loan 70 days past due in the third arrears bucket', async () => {
    await payOutLoan(application, REFUSED_LOAN_ID);
    await runNightlyComputation(application, FIRST_INSTALMENT_DUE_ON);

    await runArrearsClassification(application, daysAfter(FIRST_INSTALMENT_DUE_ON, 70));

    expect(await readLoanAsBorrower(application, REFUSED_LOAN_ID)).toMatchObject({
      arrearsBucket: 'SixtyOneToNinetyDays',
    });
  });

  it('places a loan 100 days past due over ninety days', async () => {
    await payOutLoan(application, REFUSED_LOAN_ID);
    await runNightlyComputation(application, FIRST_INSTALMENT_DUE_ON);

    await runArrearsClassification(application, daysAfter(FIRST_INSTALMENT_DUE_ON, 100));

    expect(await readLoanAsBorrower(application, REFUSED_LOAN_ID)).toMatchObject({
      arrearsBucket: 'OverNinetyDays',
    });
  });

  it('places a loan with every instalment paid in no arrears bucket', async () => {
    await payOutLoan(application, ACCEPTED_LOAN_ID);
    await runNightlyComputation(application, FIRST_INSTALMENT_DUE_ON);

    await runArrearsClassification(application, daysAfter(FIRST_INSTALMENT_DUE_ON, 10));

    expect(await readLoanAsBorrower(application, ACCEPTED_LOAN_ID)).toMatchObject({
      arrearsBucket: 'None',
    });
  });

  it('keeps the bucket of a loan when the classification runs again the same day', async () => {
    await payOutLoan(application, REFUSED_LOAN_ID);
    await runNightlyComputation(application, FIRST_INSTALMENT_DUE_ON);
    await runArrearsClassification(application, daysAfter(FIRST_INSTALMENT_DUE_ON, 10));

    await runArrearsClassification(application, daysAfter(FIRST_INSTALMENT_DUE_ON, 10));

    expect(await readLoanAsBorrower(application, REFUSED_LOAN_ID)).toMatchObject({
      arrearsBucket: 'OneToThirtyDays',
    });
  });

  it('moves the loan to the next bucket when it goes further past due', async () => {
    await payOutLoan(application, REFUSED_LOAN_ID);
    await runNightlyComputation(application, FIRST_INSTALMENT_DUE_ON);
    await runArrearsClassification(application, daysAfter(FIRST_INSTALMENT_DUE_ON, 10));

    await runArrearsClassification(application, daysAfter(FIRST_INSTALMENT_DUE_ON, 40));

    expect(await readLoanAsBorrower(application, REFUSED_LOAN_ID)).toMatchObject({
      arrearsBucket: 'ThirtyOneToSixtyDays',
    });
  });

  it('is audited as the classification job of the bank', async () => {
    await payOutLoan(application, REFUSED_LOAN_ID);
    await runNightlyComputation(application, FIRST_INSTALMENT_DUE_ON);

    await runArrearsClassification(application, daysAfter(FIRST_INSTALMENT_DUE_ON, 10));

    await expectJobAuditedFor(application, CLASSIFY_JOB, BANK_TENANT);
  });
});

/** The instant a number of days after another one. */
function daysAfter(instant: Date, days: number): Date {
  return new Date(instant.getTime() + days * MILLISECONDS_PER_DAY);
}

/** Runs the arrears classification of the bank on the day it is scheduled for, and settles the work it starts. */
async function runArrearsClassification(app: RunningApplication, on: Date): Promise<void> {
  await servicingOperatorAt(app, 'ada', on);

  await app.runJob(CLASSIFY_JOB);
  await app.settled();
}
