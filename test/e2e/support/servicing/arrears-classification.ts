import type { RunningApplication } from '$test/e2e/support/start-application';
import { servicingOperatorAt } from '$test/e2e/support/servicing/loan-retention';

/** The job that places each open loan of the bank in its arrears bucket each day, by its name in the application. */
export const CLASSIFY_JOB = 'servicing.classify-arrears';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/** The instant a number of days after another one. */
export function daysAfter(instant: Date, days: number): Date {
  return new Date(instant.getTime() + days * MILLISECONDS_PER_DAY);
}

/** Runs the arrears classification of the bank on the day it is scheduled for, and settles the work it starts. */
export async function runArrearsClassification(app: RunningApplication, on: Date): Promise<void> {
  await servicingOperatorAt(app, 'ada', on);

  await app.runJob(CLASSIFY_JOB);
  await app.settled();
}
