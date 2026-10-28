import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { expectStatus, type HttpClient } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { operatorOf, registeredCustomer } from '$test/e2e/support/customer-due-diligence/customer-files';
import { BANK_TENANT, openBank } from '$test/e2e/support/servicing/bank';
import { servicingOperatorAt } from '$test/e2e/support/servicing/loan-retention';
import { borrowerOf, publishPayoutAuthorised } from '$test/e2e/support/servicing/payout-authorised';

/** The job that records, each night, the instalments of the open loans of a bank that have fallen due. */
const COMPUTE_JOB = 'servicing.compute-due-instalments';
/** The loan of the application: its borrower reads it, and its statement, through the API. */
const LOAN_ID = 'loan-1';
/** The loan is paid out on the tenth of January: its first instalment falls due on the tenth of February. */
const PAID_OUT_ON = new Date('2026-01-10T00:00:00.000Z');
/** The nightly run of the tenth of March: the first two instalments have fallen due. */
const NIGHTLY_RUN_ON_THE_TENTH_OF_MARCH = new Date('2026-03-10T00:00:00.000Z');
/** The statement read on the fifteenth of March: five days after the second instalment fell due. */
const MID_MARCH = new Date('2026-03-15T00:00:00.000Z');
/** A date before the first instalment: the loan had no instalment due yet. */
const EARLY_FEBRUARY = new Date('2026-02-01T00:00:00.000Z');

describe('Get loan statement, end to end', () => {
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

  it('answers 401 to a caller who presents no credential', async () => {
    const response = await application.client.get(`/loans/${LOAN_ID}/statement?asOf=${MID_MARCH.toISOString()}`);

    expectStatus(response, 401);
  });

  it('answers 403 to an actor who does not hold the permission', async () => {
    await payOutLoan(application);
    const stranger = await application.as({ id: 'stranger', roles: [] });

    const response = await stranger.get(`/loans/${LOAN_ID}/statement?asOf=${MID_MARCH.toISOString()}`);

    expectStatus(response, 403);
  });

  it('answers the instalments due on the date the borrower asks for, replayed from the events', async () => {
    await payOutLoan(application);
    await runNightlyComputation(application, NIGHTLY_RUN_ON_THE_TENTH_OF_MARCH);

    const statement = await readStatement(await borrowerClient(application), MID_MARCH);

    expect(statement).toMatchObject({ loanId: LOAN_ID, instalmentsDue: [1, 2], daysPastDue: 0 });
  });

  it('answers the statement as the loan stood before the instalments fell due, not as it stands now', async () => {
    await payOutLoan(application);
    await runNightlyComputation(application, NIGHTLY_RUN_ON_THE_TENTH_OF_MARCH);

    const statement = await readStatement(await borrowerClient(application), EARLY_FEBRUARY);

    expect(statement).toMatchObject({ instalmentsDue: [], outstandingCapitalCents: 100_000 });
  });

  it('answers the outstanding capital of the loan at its payout on the day it is paid out', async () => {
    await payOutLoan(application);

    const statement = await readStatement(await borrowerClient(application), PAID_OUT_ON);

    expect(statement).toMatchObject({ outstandingCapitalCents: 100_000, arrearsCents: 0 });
  });

  it('refuses a date that is not an ISO instant with 422', async () => {
    await payOutLoan(application);

    const response = await (await borrowerClient(application)).get(`/loans/${LOAN_ID}/statement?asOf=yesterday`);

    expectStatus(response, 422);
  });
});

/** Pays the loan out on PAID_OUT_ON, as the authorised payout of its application: the loan then belongs to that application. */
async function payOutLoan(app: RunningApplication): Promise<void> {
  const customerId = await registeredCustomer(await operatorOf(app, 'ada'));

  await servicingOperatorAt(app, 'ada', PAID_OUT_ON);
  await publishPayoutAuthorised(app, { applicationId: LOAN_ID, customerId, occurredAt: PAID_OUT_ON.toISOString() });
}

/** Runs the nightly computation of the bank on the day it is scheduled for, and settles the work it starts. */
async function runNightlyComputation(app: RunningApplication, nightlyRun: Date): Promise<void> {
  await servicingOperatorAt(app, 'ada', nightlyRun);

  await app.runJob(COMPUTE_JOB);
  await app.settled();
}

/** The borrower of the loan, who reads it through the API. */
function borrowerClient(app: RunningApplication): Promise<HttpClient> {
  return borrowerOf(app, 'bob', LOAN_ID);
}

/** The statement of the loan on the date, as the borrower reads it through the API: the answer must be a success. */
async function readStatement(borrower: HttpClient, asOf: Date): Promise<Record<string, unknown>> {
  const response = await borrower.get(`/loans/${LOAN_ID}/statement?asOf=${asOf.toISOString()}`);

  expectStatus(response, 200);

  return response.body as Record<string, unknown>;
}
