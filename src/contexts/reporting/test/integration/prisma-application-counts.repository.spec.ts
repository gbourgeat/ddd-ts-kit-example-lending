import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { type Actor, executionContext, type ExecutionContext, FixedExecutionScope } from '@ddd-ts-kit/kernel';
import { creditApplicationSubmittedV2 } from '@/contexts/credit-application/published-language';
import { ApplicationCountProjection } from '@/contexts/reporting/application/projections/application-count.projection';
import { PrismaApplicationCounts } from '@/contexts/reporting/infrastructure/persistence/prisma-application-counts.repository';
import { openTestDatabase, type TestDatabase } from '@/platform/database/open-test-database';

let database: TestDatabase;

beforeAll(async () => {
  database = await openTestDatabase();
});

afterAll(async () => {
  await database.close();
});

beforeEach(async () => {
  await database.reset();
});

describe('PrismaApplicationCounts, the applications of a branch and month', () => {
  it('keeps the count and the amount of a branch and month, read back by its key', async () => {
    const scope = new FixedExecutionScope(workOf('acme-bank'));
    const counts = new PrismaApplicationCounts(database.persistence.database, scope);
    const projection = new ApplicationCountProjection(counts);

    await projection.submitted(submitted('credit-application-1', 1000));
    await projection.submitted(submitted('credit-application-2', 2500));

    const line = await counts.get('acme-bank:branch-1:2026-03');

    expect(line).toMatchObject({
      tenantId: 'acme-bank',
      branchId: 'branch-1',
      month: '2026-03',
      applicationCount: 2,
      amountCents: 3500,
    });
  });

  it('hides from another tenant the applications counted for acme-bank', async () => {
    const scope = new FixedExecutionScope(workOf('acme-bank'));
    const counts = new PrismaApplicationCounts(database.persistence.database, scope);

    await new ApplicationCountProjection(counts).submitted(submitted('credit-application-1', 1000));

    scope.enter(workOf('globex'));

    expect(await counts.get('acme-bank:branch-1:2026-03')).toBeUndefined();
  });
});

function submitted(id: string, requestedAmountCents: number) {
  return {
    ...creditApplicationSubmittedV2.create(
      {
        creditApplicationId: id,
        applicantId: 'customer-7',
        requestedAmountCents,
        durationMonths: 60,
        branchId: 'branch-1',
      },
      { id: `event-${id}`, occurredAt: '2026-03-14T09:00:00.000Z' },
    ),
    tenantId: 'acme-bank',
  };
}

function workOf(tenantId: string): ExecutionContext {
  const actor: Actor = { id: 'member-of-' + tenantId, type: 'user', tenantId, roles: [], attributes: {} };

  return executionContext({ correlationId: 'reporting-spec', actor, origin: 'test' });
}
