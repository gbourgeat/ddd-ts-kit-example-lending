import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import {
  type Actor,
  executionContext,
  type ExecutionContext,
  FixedExecutionScope,
  offsetPage,
} from '@ddd-ts-kit/kernel';
import { creditApplicationPayoutAuthorisedV1 } from '@/contexts/credit-application/published-language';
import { loanArrearsBucketEnteredV1, loanDefaultedV1 } from '@/contexts/servicing/published-language';
import { DefaultedLoanProjection } from '@/contexts/reporting/application/projections/defaulted-loan.projection';
import { LoanPrincipalProjection } from '@/contexts/reporting/application/projections/loan-principal.projection';
import { PortfolioAtRiskProjection } from '@/contexts/reporting/application/projections/portfolio-at-risk.projection';
import { DefaultsListFromDefaultedLoansReader } from '@/contexts/reporting/infrastructure/persistence/defaults-list-from-defaulted-loans.reader';
import { PrismaDefaultedLoan } from '@/contexts/reporting/infrastructure/persistence/prisma-defaulted-loan.repository';
import { PrismaDefaultedLoansReader } from '@/contexts/reporting/infrastructure/persistence/prisma-defaulted-loans.reader';
import { PrismaLoanPrincipal } from '@/contexts/reporting/infrastructure/persistence/prisma-loan-principal.repository';
import { PrismaMonthlyReportReader } from '@/contexts/reporting/infrastructure/persistence/prisma-monthly-report.reader';
import { PrismaPortfolioAtRisk } from '@/contexts/reporting/infrastructure/persistence/prisma-portfolio-at-risk.repository';
import { PrismaPortfolioAtRiskPerBranchReader } from '@/contexts/reporting/infrastructure/persistence/prisma-portfolio-at-risk-per-branch.reader';
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

describe('The readers of the reports over their tables, for the tenant of the work', () => {
  it('shares the portfolio at risk of a branch: the capital in arrears over the capital paid out', async () => {
    const { scope, portfolio } = await seeded();

    scope.enter(workOf('acme-bank'));
    const { branches } = await portfolio.read();

    expect(branches).toHaveLength(1);
    expect(branches[0]).toMatchObject({ branchId: 'branch-1' });
  });

  it('lists the loans in default with the branch and the capital they were paid out on', async () => {
    const { defaulted } = await seeded();

    const { loans } = await defaulted.read();

    expect(loans).toEqual([
      expect.objectContaining({ loanId: 'loan-1', branchId: 'branch-1', principalCents: 100_000 }),
    ]);
  });

  it('answers the defaults list from the same loans in default', async () => {
    const { defaulted } = await seeded();

    const list = await new DefaultsListFromDefaultedLoansReader(defaulted).read({} as never);

    expect(list).toEqual(await defaulted.read());
  });

  it('keeps the loans of acme-bank out of the reports of another bank', async () => {
    const { scope, defaulted } = await seeded();

    scope.enter(workOf('globex'));

    expect((await defaulted.read()).loans).toEqual([]);
  });

  it('answers the monthly report of a month in which a branch had no application, with the portfolio at risk', async () => {
    const { scope, portfolio } = await seeded();
    const monthly = new PrismaMonthlyReportReader(database.persistence.database, scope, portfolio);

    const page = await monthly.search({ kind: 'all' }, '2026-03', offsetPage());

    expect(page.items.every((line) => line.branchId === 'branch-1')).toBe(true);
    expect(page.total).toBe(page.items.length);
  });
});

async function seeded() {
  const scope = new FixedExecutionScope(workOf('acme-bank'));
  const db = database.persistence.database;
  const principals = new LoanPrincipalProjection(new PrismaLoanPrincipal(db, scope));
  const arrears = new PortfolioAtRiskProjection(new PrismaPortfolioAtRisk(db, scope));
  const defaults = new DefaultedLoanProjection(new PrismaDefaultedLoan(db, scope));

  await principals.payoutAuthorised(payout());
  await arrears.arrearsBucketEntered(bucketEntered());
  await defaults.defaulted(defaulted());

  return {
    scope,
    portfolio: new PrismaPortfolioAtRiskPerBranchReader(db, scope),
    defaulted: new PrismaDefaultedLoansReader(db, scope),
  };
}

function payout() {
  return {
    ...creditApplicationPayoutAuthorisedV1.create(
      {
        creditApplicationId: 'loan-1',
        customerId: 'customer-1',
        branchId: 'branch-1',
        amountCents: 100_000,
        durationMonths: 12,
        rateBasisPoints: 500,
      },
      { id: 'event-payout', occurredAt: '2026-03-01T00:00:00.000Z' },
    ),
    tenantId: 'acme-bank',
  };
}

function bucketEntered() {
  return {
    ...loanArrearsBucketEnteredV1.create(
      { loanId: 'loan-1', bucket: 'OverNinetyDays' },
      { id: 'event-bucket', occurredAt: '2026-06-01T00:00:00.000Z' },
    ),
    tenantId: 'acme-bank',
  };
}

function defaulted() {
  return {
    ...loanDefaultedV1.create({ loanId: 'loan-1' }, { id: 'event-default', occurredAt: '2026-06-02T00:00:00.000Z' }),
    tenantId: 'acme-bank',
  };
}

function workOf(tenantId: string): ExecutionContext {
  const actor: Actor = { id: 'member-of-' + tenantId, type: 'user', tenantId, roles: [], attributes: {} };

  return executionContext({ correlationId: 'reporting-spec', actor, origin: 'test' });
}
