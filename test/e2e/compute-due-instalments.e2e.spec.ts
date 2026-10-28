import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { expectJobAuditedFor } from '$test/e2e/support/job-audit';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { servicingOperatorAt } from '$test/e2e/support/servicing/loan-retention';
import { BANK_TENANT, openBank } from '$test/e2e/support/servicing/bank';
import { borrowerOf, publishPayoutAuthorised } from '$test/e2e/support/servicing/payout-authorised';
import { operatorOf, registeredCustomer } from '$test/e2e/support/customer-due-diligence/customer-files';

const COMPUTE_JOB = 'servicing.compute-due-instalments';
/** The loan is read by its borrower, who reads the application the loan comes from: the loan and its application share an id. */
const LOAN_ID = 'loan-1';

/** The loan is paid out on the tenth of January: its first instalment falls due on the tenth of February. */
const PAID_OUT_ON = new Date('2026-01-10T00:00:00.000Z');
/** The nightly run of the tenth of March, when the first two instalments have fallen due. */
const NIGHTLY_RUN_ON_THE_TENTH_OF_MARCH = new Date('2026-03-10T00:00:00.000Z');
/** The nightly run of the ninth of February, before the first instalment falls due. */
const NIGHTLY_RUN_ON_THE_NINTH_OF_FEBRUARY = new Date('2026-02-09T00:00:00.000Z');

// No route starts "compute due instalments": servicing.compute-due-instalments sends its command when its schedule is due, so the spec runs the job as the scheduler would.
describe('Compute the instalments due each night, per bank, end to end', () => {
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

  it('records the instalments fallen due at the nightly run, and lets the borrower read them', async () => {
    await payOutLoan(application);
    await runNightlyComputation(application, NIGHTLY_RUN_ON_THE_TENTH_OF_MARCH);

    expect(await readLoanAsBorrower(application)).toMatchObject({ instalmentsDue: [1, 2] });
  });

  it('records the job command in the audit of the bank, as the system actor of the job', async () => {
    await payOutLoan(application);

    await runNightlyComputation(application, NIGHTLY_RUN_ON_THE_TENTH_OF_MARCH);

    await expectJobAuditedFor(application, COMPUTE_JOB, BANK_TENANT);
  });

  it('records nothing twice when the nightly run is repeated the same night', async () => {
    await payOutLoan(application);
    await runNightlyComputation(application, NIGHTLY_RUN_ON_THE_TENTH_OF_MARCH);

    await runNightlyComputation(application, NIGHTLY_RUN_ON_THE_TENTH_OF_MARCH);

    expect(await readLoanAsBorrower(application)).toMatchObject({ instalmentsDue: [1, 2] });
  });

  it('records no instalment due before the day its first instalment falls due', async () => {
    await payOutLoan(application);

    await runNightlyComputation(application, NIGHTLY_RUN_ON_THE_NINTH_OF_FEBRUARY);

    expect(await readLoanAsBorrower(application)).toMatchObject({ instalmentsDue: [] });
  });
});

/** Pays the loan out on PAID_OUT_ON, as the authorised payout of its application: the loan then belongs to that application. */
async function payOutLoan(app: RunningApplication): Promise<void> {
  const customerId = await registeredCustomer(await operatorOf(app, 'ada'));

  // The loan is paid out on the instant the platform clock reads when the payout is recorded: the clock is set there.
  await servicingOperatorAt(app, 'ada', PAID_OUT_ON);
  await publishPayoutAuthorised(app, { applicationId: LOAN_ID, customerId, occurredAt: PAID_OUT_ON.toISOString() });
}

/** Runs the nightly computation of the bank on the day it is scheduled for, and settles the work it starts. */
async function runNightlyComputation(app: RunningApplication, nightlyRun: Date): Promise<void> {
  await servicingOperatorAt(app, 'ada', nightlyRun);

  await app.runJob(COMPUTE_JOB);
  await app.settled();
}

/** The loan as its borrower reads it through the API: the answer carries the instalments due. */
async function readLoanAsBorrower(app: RunningApplication): Promise<unknown> {
  const borrower = await borrowerOf(app, 'bob', LOAN_ID);
  const response = await borrower.get(`/loans/${LOAN_ID}`);

  expectStatus(response, 200);

  return response.body;
}
