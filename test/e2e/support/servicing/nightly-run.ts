import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { operatorOf, registeredCustomer } from '$test/e2e/support/customer-due-diligence/customer-files';
import type { RunningApplication } from '$test/e2e/support/start-application';
import { servicingOperatorAt } from '$test/e2e/support/servicing/loan-retention';
import { borrowerOf, publishPayoutAuthorised } from '$test/e2e/support/servicing/payout-authorised';

/** The subject of the system actor that collects the instalments noted due: its relation is granted to the context. */
const COLLECT_DUE_INSTALMENT_SUBJECT = 'system:system:CollectDueInstalmentEventHandler';

/**
 * Grants the system actor of the due-instalment reaction the operator relation on servicing, as the platform does for the
 * actors it knows: a nightly run that notes an instalment due sends its collection as this actor.
 */
export async function grantDueInstalmentCollection(app: RunningApplication): Promise<void> {
  await app.relate({ object: 'context:servicing', relation: 'operator', subject: COLLECT_DUE_INSTALMENT_SUBJECT });
}

/** The job that notes the instalments due each night, by its name in the application. */
export const COMPUTE_JOB = 'servicing.compute-due-instalments';

/** The instant the loans of these specs are paid out: their first instalment falls due on the tenth of February. */
export const PAID_OUT_ON = new Date('2026-01-10T00:00:00.000Z');

/**
 * Pays a loan out on PAID_OUT_ON, as the authorised payout of its application: the loan takes the id of that application,
 * which is also the mandate of its direct debits.
 */
export async function payOutLoan(app: RunningApplication, loanId: string): Promise<void> {
  const customerId = await registeredCustomer(await operatorOf(app, 'ada'));

  await servicingOperatorAt(app, 'ada', PAID_OUT_ON);
  await publishPayoutAuthorised(app, { applicationId: loanId, customerId, occurredAt: PAID_OUT_ON.toISOString() });
}

/** Runs the nightly computation of the bank on the day it is scheduled for, and settles the work it starts. */
export async function runNightlyComputation(app: RunningApplication, nightlyRun: Date): Promise<void> {
  await servicingOperatorAt(app, 'ada', nightlyRun);

  await app.runJob(COMPUTE_JOB);
  await app.settled();
}

/** The loan as its borrower reads it through the API: the answer carries the instalments due, paid and unpaid. */
export async function readLoanAsBorrower(app: RunningApplication, loanId: string): Promise<unknown> {
  const borrower = await borrowerOf(app, 'bob', loanId);
  const response = await borrower.get(`/loans/${loanId}`);

  expectStatus(response, 200);

  return response.body;
}
