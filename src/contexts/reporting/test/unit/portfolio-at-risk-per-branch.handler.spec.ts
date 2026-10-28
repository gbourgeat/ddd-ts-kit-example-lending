import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { reportingPermissions } from '@/contexts/reporting/reporting.permissions';
import { PortfolioAtRiskPerBranchHandler } from '@/contexts/reporting/application/queries/portfolio-at-risk-per-branch/portfolio-at-risk-per-branch.handler';
import { PortfolioAtRiskPerBranchQuery } from '@/contexts/reporting/application/queries/portfolio-at-risk-per-branch/portfolio-at-risk-per-branch.query';
import type { PortfolioAtRiskPerBranchResult } from '@/contexts/reporting/application/queries/portfolio-at-risk-per-branch/portfolio-at-risk-per-branch.result';
import { FakePortfolioAtRiskPerBranchReader } from '@/contexts/reporting/test/fakes/portfolio-at-risk-per-branch-reader.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [reportingPermissions['report.portfolio-at-risk']] },
  }),
  map: AuthorizationMap.of(requires(PortfolioAtRiskPerBranchQuery, reportingPermissions['report.portfolio-at-risk'])),
});

const holder = anActor().withRole('holder').build();

describe('Portfolio at risk per branch', () => {
  it('answers what the read model holds, branch by branch', async () => {
    const answer: PortfolioAtRiskPerBranchResult = { branches: [branchLine('branch-1'), branchLine('branch-2')] };
    const queryBus = arrange(answer);
    const query = new PortfolioAtRiskPerBranchQuery(holder);

    expect(await queryBus.execute(query)).toEqual(answer);
  });

  it('is refused to an actor who does not hold the permission report.portfolio-at-risk', async () => {
    const queryBus = arrange({ branches: [] });
    const query = new PortfolioAtRiskPerBranchQuery(anActor().build());

    await expect(queryBus.execute(query)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

function branchLine(branchId: string): PortfolioAtRiskPerBranchResult['branches'][number] {
  return {
    branchId,
    paidOutCents: 0,
    oneToThirtyDaysCents: 0,
    thirtyOneToSixtyDaysCents: 0,
    sixtyOneToNinetyDaysCents: 0,
    overNinetyDaysCents: 0,
    atRiskCents: 0,
    portfolioAtRiskBasisPoints: 0,
  };
}

function arrange(answer: PortfolioAtRiskPerBranchResult) {
  const { queryBus } = createTestBuses();
  const handler = new PortfolioAtRiskPerBranchHandler(new FakePortfolioAtRiskPerBranchReader(answer));

  return queryBus.use(holders).register(PortfolioAtRiskPerBranchQuery, handler);
}
