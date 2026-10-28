import { describe, expect, it } from '@jest/globals';
import {
  AuthorizationMap,
  PolicyAccess,
  RoleBasedAuthorizer,
  authorizationMiddleware,
  requires,
} from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { FixedClock, offsetPage } from '@ddd-ts-kit/kernel';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { reportingPermissions } from '@/contexts/reporting/reporting.permissions';
import { MonthlyReportHandler } from '@/contexts/reporting/application/queries/monthly-report/monthly-report.handler';
import { MonthlyReportQuery } from '@/contexts/reporting/application/queries/monthly-report/monthly-report.query';
import type { MonthlyReportItem } from '@/contexts/reporting/application/queries/monthly-report/monthly-report.result';
import { FakeMonthlyReportReader } from '@/contexts/reporting/test/fakes/monthly-report-reader.fake';

const authorizer = new RoleBasedAuthorizer({
  roles: { holder: [reportingPermissions['report.monthly']] },
});

const holders = authorizationMiddleware({
  authorizer,
  map: AuthorizationMap.of(requires(MonthlyReportQuery, reportingPermissions['report.monthly'])),
});

const holder = anActor().withRole('holder').build();
const MARCH = '2026-03';

describe('Monthly report', () => {
  it('answers one page of the month, with the total, one line per branch', async () => {
    const lines = [aLine('branch-1', MARCH), aLine('branch-2', MARCH), aLine('branch-3', '2026-04')];
    const queryBus = arrange(lines);

    const page = await queryBus.execute(new MonthlyReportQuery(holder, offsetPage({ limit: 1 }), MARCH));

    expect(page).toEqual({ items: [lines[0]], total: 2 });
  });

  it('is refused to an actor who does not hold the permission report.monthly', async () => {
    const queryBus = arrange([aLine('branch-1', MARCH)]);
    const query = new MonthlyReportQuery(anActor().build(), offsetPage(), MARCH);

    await expect(queryBus.execute(query)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('answers the lines of the month asked, and no other', async () => {
    const queryBus = arrange([aLine('branch-1', '2026-02'), aLine('branch-1', MARCH)]);

    const page = await queryBus.execute(new MonthlyReportQuery(holder, offsetPage(), MARCH));

    expect(page.items).toEqual([aLine('branch-1', MARCH)]);
  });
});

function aLine(branchId: string, month: string): MonthlyReportItem {
  return {
    id: branchId,
    branchId,
    month,
    applicationCount: 2,
    applicationAmountCents: 3500,
    decisionCount: 2,
    approvalCount: 1,
    exceptionCount: 0,
    approvalRateBasisPoints: 5000,
    exceptionShareBasisPoints: 0,
    portfolioAtRiskBasisPoints: 0,
  };
}

function arrange(lines: readonly MonthlyReportItem[]) {
  const { queryBus } = createTestBuses();
  const access = new PolicyAccess({ authorizer, clock: new FixedClock(new Date('2026-01-01T00:00:00.000Z')) });
  const handler = new MonthlyReportHandler(new FakeMonthlyReportReader(lines), access);

  return queryBus.use(holders).register(MonthlyReportQuery, handler);
}
