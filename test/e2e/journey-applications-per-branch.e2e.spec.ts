import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { assignCustomerToAdvisorOnBranch } from '$test/e2e/support/credit-application/advisor-branch';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';

const tenantId = 'acme-bank';

describe('Count the applications of each branch in the month, end to end', () => {
  let application: RunningApplication;

  beforeAll(async () => {
    application = await startApplication();
  });

  afterAll(async () => {
    await application.close();
  });

  it('counts and sums the applications submitted on each branch in the month of their submission', async () => {
    const month = monthOf(new Date());
    const first = await assignCustomerToAdvisorOnBranch(application, 'customer-7', tenantId);
    const second = await assignCustomerToAdvisorOnBranch(application, 'customer-8', tenantId);

    await application.relate({ object: 'customer:customer-7', relation: 'self', subject: 'user:customer-7' });
    await application.relate({ object: 'customer:customer-8', relation: 'self', subject: 'user:customer-8' });
    const seven = await application.as({ id: 'customer-7', tenantId });
    const eight = await application.as({ id: 'customer-8', tenantId });

    expectStatus(await seven.post('/applications', applicationFor(1000)), 201);
    expectStatus(await seven.post('/applications', applicationFor(2500)), 201);
    expectStatus(await eight.post('/applications', applicationFor(700)), 201);
    await application.settled();

    const rows = await applicationsPerBranch(application, tenantId);

    expect(rows).toEqual(
      expect.arrayContaining([
        { branchId: first.branchId, month, applicationCount: 2, amountCents: 3500 },
        { branchId: second.branchId, month, applicationCount: 1, amountCents: 700 },
      ]),
    );
  });
});

function applicationFor(cents: number) {
  return { productId: 'personal-loan', amount: { cents, currency: 'EUR' }, durationMonths: 60 };
}

/** The month of an instant in UTC, as the read model keys it: `YYYY-MM`. */
function monthOf(instant: Date): string {
  return instant.toISOString().slice(0, YEAR_AND_MONTH_LENGTH);
}

/** The rows of the tenant's applications-per-branch read model, read from its table (the started application keeps no route for it yet). */
async function applicationsPerBranch(application: RunningApplication, tenantId: string) {
  const rows = await application.persistence.database.client().reportingApplicationCount.findMany({
    where: { tenantId },
    orderBy: [{ branchId: 'asc' }, { month: 'asc' }],
  });

  return rows.map((row) => ({
    branchId: row.branchId,
    month: row.month,
    applicationCount: row.applicationCount,
    amountCents: Number(row.amountCents),
  }));
}

const YEAR_AND_MONTH_LENGTH = 7;
