import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ERASED_PERSONAL_DATA } from '@ddd-ts-kit/kernel';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { expectJobAuditedFor } from '$test/e2e/support/job-audit';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { readLoan, storePaidOutLoan } from '$test/e2e/support/servicing/paid-out-loan';
import { NIGHTLY_RUN, servicingOperatorAt } from '$test/e2e/support/servicing/loan-retention';

const ERASE_JOB = 'servicing.erase-personal-data-past-retention';
const tenantId = 'acme-bank';

/** A loan closed more than ten years before the nightly run. */
const CLOSED_LONG_AGO = new Date('2014-01-10T08:00:00.000Z');
/** A loan closed less than ten years before the nightly run. */
const CLOSED_RECENTLY = new Date('2024-06-01T08:00:00.000Z');
const PAID_OUT_AT = new Date('2013-12-01T00:00:00.000Z');
const PAID_OUT_RECENTLY = new Date('2024-05-01T00:00:00.000Z');

describe('Erase the personal data of loans past retention, end to end', () => {
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

  it('erases the name and postal address of a loan closed more than ten years before the nightly run', async () => {
    await closedLoan(application, 'loan-old', PAID_OUT_AT, CLOSED_LONG_AGO);

    await runNightlyErasure(application);

    expect((await readLoan(application, 'loan-old'))?.borrower?.name).toBe(ERASED_PERSONAL_DATA);
  });

  it('keeps the name of a loan closed less than ten years before the nightly run', async () => {
    await closedLoan(application, 'loan-recent', PAID_OUT_RECENTLY, CLOSED_RECENTLY);

    await runNightlyErasure(application);

    expect((await readLoan(application, 'loan-recent'))?.borrower?.name).toBe('Ada Lovelace');
  });

  it('keeps the loan erased still closed: its ledger stays readable', async () => {
    await closedLoan(application, 'loan-old', PAID_OUT_AT, CLOSED_LONG_AGO);

    await runNightlyErasure(application);

    expect((await readLoan(application, 'loan-old'))?.closedAt).toEqual(CLOSED_LONG_AGO);
  });
});

/** Opens the bank as an administrator of identity: the tenant the nightly job runs in. */
async function openBank(app: RunningApplication): Promise<void> {
  await app.relate({ object: 'context:identity', relation: 'operator', subject: 'user:ada' });
  const ada = await app.as({ id: 'ada', roles: ['admin'] });

  expectStatus(await ada.put('/accounts/me', {}), 200);
  expectStatus(await ada.post('/organisations', { slug: tenantId, name: 'Acme Bank' }), 201);
}

/** Stores a loan paid out on `paidOutAt`, then closes it on `closedOn`. */
async function closedLoan(app: RunningApplication, id: string, paidOutAt: Date, closedOn: Date): Promise<void> {
  await storePaidOutLoan(app, id, paidOutAt);
  const operator = await servicingOperatorAt(app, 'ada', closedOn);

  expectStatus(await operator.post(`/loans/${id}/closure`, {}), 204);
  await app.settled();
}

/** Runs the nightly erasure of the bank on the day it is scheduled for. */
async function runNightlyErasure(app: RunningApplication): Promise<void> {
  await servicingOperatorAt(app, 'ada', NIGHTLY_RUN);
  await app.runJob(ERASE_JOB);
  await app.settled();
  await expectJobAuditedFor(app, ERASE_JOB, tenantId);
}
