import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { collectEvents } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { BANK_TENANT, openBank } from '$test/e2e/support/servicing/bank';
import { payOutLoan, runNightlyComputation } from '$test/e2e/support/servicing/nightly-run';
import { servicingOperatorAt } from '$test/e2e/support/servicing/loan-retention';

const bucketEntered = 'servicing.loan.arrears-bucket-entered';
const defaulted = 'servicing.loan.defaulted';

/** A loan whose mandate the payer's bank refuses: the simulated provider refuses the mandates prefixed `refused-`. */
const REFUSED_LOAN_ID = 'refused-loan-1';
const FIRST_INSTALMENT_DUE_ON = new Date('2026-02-10T00:00:00.000Z');
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

describe('Publish the arrears bucket entered and the default for reporting, end to end', () => {
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

  it('publishes the bucket a loan enters and its default 100 days past due', async () => {
    const received = collectEvents(application.events, [bucketEntered, defaulted]);

    await payOutLoan(application, REFUSED_LOAN_ID);
    await runNightlyComputation(application, FIRST_INSTALMENT_DUE_ON);

    await runJob(application, 'servicing.classify-arrears', 100);
    await runJob(application, 'servicing.declare-default', 100);
    received.stop();

    expect(received.received(bucketEntered).map((event) => event.payload)).toEqual([
      { loanId: REFUSED_LOAN_ID, bucket: 'OverNinetyDays' },
    ]);

    expect(received.received(defaulted).map((event) => event.payload)).toEqual([{ loanId: REFUSED_LOAN_ID }]);
  });
});

/** Runs a nightly job of the bank a number of days after the first instalment fell due, and settles the work it starts. */
async function runJob(app: RunningApplication, job: string, days: number): Promise<void> {
  await servicingOperatorAt(app, 'ada', new Date(FIRST_INSTALMENT_DUE_ON.getTime() + days * MILLISECONDS_PER_DAY));

  await app.runJob(job);
  await app.settled();
}
