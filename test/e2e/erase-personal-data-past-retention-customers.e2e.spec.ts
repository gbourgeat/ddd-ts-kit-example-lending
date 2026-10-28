import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { expectJobAuditedFor } from '$test/e2e/support/job-audit';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { aPersonBody } from '$test/e2e/support/customer-due-diligence/customer-files';
import { operatorAt } from '$test/e2e/support/customer-due-diligence/overdue-flags';

const ADA_BIRTH_DATE = '1980-05-01T00:00:00.000Z';
const ERASE_JOB = 'customer-due-diligence.erase-personal-data-past-retention';
const tenantId = 'acme-bank';

/** A relationship ended more than five years before the nightly run. */
const ENDED_LONG_AGO = new Date('2020-01-10T08:00:00.000Z');
/** A relationship ended less than five years before the nightly run. */
const ENDED_RECENTLY = new Date('2024-06-01T08:00:00.000Z');
const NIGHTLY_RUN = new Date('2026-01-10T03:00:00.000Z');

describe('Erase the personal data of customers past retention, end to end', () => {
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
    application.screening.record('Ada Lovelace', new Date(ADA_BIRTH_DATE));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('erases the personal data of a customer whose relationship ended more than five years before the nightly run', async () => {
    const longAgo = await endedRelationship(application, ENDED_LONG_AGO, '12AB34567');

    await runNightlyErasure(application);

    expect(await erasedSubjects(application)).toContain(longAgo);
  });

  it('keeps the personal data of a customer whose relationship ended less than five years before the nightly run', async () => {
    const recently = await endedRelationship(application, ENDED_RECENTLY, '98CD76543');

    await runNightlyErasure(application);

    expect(await erasedSubjects(application)).not.toContain(recently);
  });

  it('keeps the file of an erased customer readable: its risk rating still answers', async () => {
    const longAgo = await endedRelationship(application, ENDED_LONG_AGO, '12AB34567');

    await runNightlyErasure(application);

    const operator = await operatorAt(application, NIGHTLY_RUN);
    const rating = await operator.get(`/customers/${longAgo}/risk-rating`);

    expectStatus(rating, 200);
    expect(rating.body).toMatchObject({ customerId: longAgo });
  });

  it('runs again without failing once the personal data is erased', async () => {
    await endedRelationship(application, ENDED_LONG_AGO, '12AB34567');

    await runNightlyErasure(application);

    await expect(runNightlyErasure(application)).resolves.toBeDefined();
  });
});

/** Opens the bank as an administrator of identity: the tenant the nightly job runs in. */
async function openBank(app: RunningApplication): Promise<void> {
  await app.relate({ object: 'context:identity', relation: 'operator', subject: 'user:ada' });
  const ada = await app.as({ id: 'ada', roles: ['admin'] });

  expectStatus(await ada.put('/accounts/me', {}), 200);
  expectStatus(await ada.post('/organisations', { slug: tenantId, name: 'Acme Bank' }), 201);
}

/** Identifies a customer on the day, confirms its sanctions match, which ends the relationship that day: its identifier. */
async function endedRelationship(app: RunningApplication, endedOn: Date, documentNumber: string): Promise<string> {
  const operator = await operatorAt(app, endedOn);

  const identified = await operator.post('/customers', {
    ...aPersonBody(documentNumber),
    addressProofDatedOn: endedOn.toISOString(),
  });

  expectStatus(identified, 201);

  const { id } = identified.body as { id: string };

  expectStatus(await operator.post(`/customers/${id}/matches/confirm`, {}), 201);
  await app.settled();

  return id;
}

/** Runs the nightly erasure of the bank on the day it is scheduled for. */
async function runNightlyErasure(app: RunningApplication): Promise<unknown> {
  await operatorAt(app, NIGHTLY_RUN);
  const run = await app.runJob(ERASE_JOB);

  await app.settled();
  await expectJobAuditedFor(app, ERASE_JOB, tenantId);

  return run;
}

/** The entries of the trail that record an erasure of a key, as the trail gives them back. */
async function erasedSubjects(app: RunningApplication): Promise<string> {
  await app.relate({ object: 'context:audit', relation: 'operator', subject: 'user:ada' });
  const ada = await app.as({ id: 'ada', roles: ['admin'], tenantId });
  const trail = await ada.get(`/audit/entries?action=${encodeURIComponent('personal-data:erase')}`);

  expectStatus(trail, 200);

  return JSON.stringify(trail.body);
}
