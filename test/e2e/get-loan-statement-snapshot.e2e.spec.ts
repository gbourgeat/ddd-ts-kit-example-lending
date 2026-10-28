import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { expectStatus, type HttpClient } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { operatorOf, registeredCustomer } from '$test/e2e/support/customer-due-diligence/customer-files';
import { BANK_TENANT, openBank } from '$test/e2e/support/servicing/bank';
import { servicingOperatorAt } from '$test/e2e/support/servicing/loan-retention';
import { borrowerOf, publishPayoutAuthorised } from '$test/e2e/support/servicing/payout-authorised';
import { executionContext, FixedExecutionScope, type Actor } from '@ddd-ts-kit/kernel';

/** The job that records, each night, the instalments of the open loans of a bank that have fallen due, and collects them. */
const COMPUTE_JOB = 'servicing.compute-due-instalments';
const LOAN_ID = 'loan-1';
/** The stream of the loan in the event store: the snapshot of the loan is kept under it. */
const LOAN_STREAM = `servicing.loan-${LOAN_ID}`;
/** The snapshot policy of the loan: a snapshot every twenty events of its stream. */
const SNAPSHOT_EVERY = 20;
const PAID_OUT_ON = new Date('2026-01-10T00:00:00.000Z');
/** The statement read after six nightly runs: the loan has six instalments due, and their six direct debits. */
const STATEMENT_ON = new Date('2026-07-15T00:00:00.000Z');

describe('Get loan statement, identical before and after a snapshot of the loan', () => {
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

  afterEach(() => {
    jest.useRealTimers();
  });

  it('answers the same statement of a past date before the loan has a snapshot and once it has one', async () => {
    await payOutLoan(application);
    await runNightlyRunsFrom(application, 1, 6);
    const before = await readStatement(await borrowerOf(application, 'bob', LOAN_ID), STATEMENT_ON);

    expect(await snapshotVersion(application)).toBeUndefined();

    await runNightlyRunsFrom(application, 7, 4);

    expect(await snapshotVersion(application)).toBe(SNAPSHOT_EVERY);
    expect(await readStatement(await borrowerOf(application, 'bob', LOAN_ID), STATEMENT_ON)).toEqual(before);
  });

  it('answers the instalments due of the loan as it stands once it has a snapshot', async () => {
    await payOutLoan(application);
    await runNightlyRunsFrom(application, 1, 10);

    const statement = await readStatement(await borrowerOf(application, 'bob', LOAN_ID), STATEMENT_ON);

    expect(statement).toMatchObject({ instalmentsDue: [1, 2, 3, 4, 5, 6] });
  });
});

/** Pays the loan out on PAID_OUT_ON, as the authorised payout of its application: the loan then belongs to that application. */
async function payOutLoan(app: RunningApplication): Promise<void> {
  const customerId = await registeredCustomer(await operatorOf(app, 'ada'));

  await servicingOperatorAt(app, 'ada', PAID_OUT_ON);
  await publishPayoutAuthorised(app, { applicationId: LOAN_ID, customerId, occurredAt: PAID_OUT_ON.toISOString() });
}

/** Runs the nightly computation on the tenth of each month, from the month `first` (zero is January) for `count` months. */
async function runNightlyRunsFrom(app: RunningApplication, first: number, count: number): Promise<void> {
  for (let month = first; month < first + count; month += 1) {
    await runNightlyComputation(app, new Date(Date.UTC(2026, month, 10)));
  }
}

async function runNightlyComputation(app: RunningApplication, nightlyRun: Date): Promise<void> {
  await servicingOperatorAt(app, 'ada', nightlyRun);

  await app.runJob(COMPUTE_JOB);
  await app.settled();
}

/** The version of the snapshot kept for the loan, or undefined while the loan has none. */
async function snapshotVersion(app: RunningApplication): Promise<number | undefined> {
  const snapshot = await app.persistence.eventSourcing(seedingScope()).snapshots.find(LOAN_STREAM);

  return snapshot?.version;
}

/** The work of the seeding, in the tenant the operators act for, so that the stream is the one their requests read. */
function seedingScope(): FixedExecutionScope {
  const actor: Actor = { id: `seed-of-${BANK_TENANT}`, type: 'user', tenantId: BANK_TENANT, roles: [], attributes: {} };

  return new FixedExecutionScope(executionContext({ correlationId: 'servicing-spec', actor, origin: 'test' }));
}

/** The statement of the loan on the date, as the borrower reads it through the API: the answer must be a success. */
async function readStatement(borrower: HttpClient, asOf: Date): Promise<Record<string, unknown>> {
  const response = await borrower.get(`/loans/${LOAN_ID}/statement?asOf=${asOf.toISOString()}`);

  expectStatus(response, 200);

  return response.body as Record<string, unknown>;
}
