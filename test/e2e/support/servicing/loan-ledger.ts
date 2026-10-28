import type { RunningApplication } from '$test/e2e/support/start-application';
import { servicingOperatorAt } from '$test/e2e/support/servicing/loan-retention';

/** The job that records, each night, the instalments of the open loans of a bank that have fallen due. */
const COMPUTE_JOB = 'servicing.compute-due-instalments';

/** Runs the nightly computation of the bank, as the scheduler would, at the instant `nightlyRun`, and settles the work it starts. */
export async function runNightlyComputation(app: RunningApplication, nightlyRun: Date): Promise<void> {
  await servicingOperatorAt(app, 'ada', nightlyRun);
  await app.runJob(COMPUTE_JOB);
  await app.settled();
}
