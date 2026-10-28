import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import type { RunningApplication } from '$test/e2e/support/start-application';
import { borrowerOf } from '$test/e2e/support/servicing/payout-authorised';
import { servicingOperatorAt } from '$test/e2e/support/servicing/loan-retention';

/** The job that records, each night, the instalments of the open loans of a bank that have fallen due. */
export const COMPUTE_JOB = 'servicing.compute-due-instalments';

/** The loan as its borrower reads it through the API: the answer carries its status and the instalments due. */
export async function readLoanAsBorrower(app: RunningApplication, loanId: string): Promise<unknown> {
  const borrower = await borrowerOf(app, 'bob', loanId);
  const response = await borrower.get(`/loans/${loanId}`);

  expectStatus(response, 200);

  return response.body;
}

/** Runs the nightly computation of the bank, as the scheduler would, at the instant `nightlyRun`, and settles the work it starts. */
export async function runNightlyComputation(app: RunningApplication, nightlyRun: Date): Promise<void> {
  await servicingOperatorAt(app, 'ada', nightlyRun);
  await app.runJob(COMPUTE_JOB);
  await app.settled();
}
