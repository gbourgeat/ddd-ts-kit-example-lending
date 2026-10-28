import { Controller, Get, Inject } from '@nestjs/common';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { QueryBus, type Actor } from '@ddd-ts-kit/kernel';
import { PortfolioAtRiskPerBranchQuery } from '@/contexts/reporting/application/queries/portfolio-at-risk-per-branch/portfolio-at-risk-per-branch.query';
import type { PortfolioAtRiskPerBranchResult } from '@/contexts/reporting/application/queries/portfolio-at-risk-per-branch/portfolio-at-risk-per-branch.result';
import { ReportsRoutes } from '@/contexts/reporting/presentation/http/reports.routes';
import { PortfolioAtRiskPerBranchAnswer } from '@/contexts/reporting/presentation/http/reports/portfolio-at-risk-per-branch/portfolio-at-risk-per-branch.answer';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: ReportsRoutes })
export class PortfolioAtRiskPerBranchController {
  constructor(@Inject(QueryBus) private readonly queries: QueryBus) {}

  /** The report is the context itself: its refusals are the permission of the group's guards, none of its own. */
  @Get('portfolio-at-risk')
  @KitRoute({
    errors: [],
  })
  async portfolioAtRiskPerBranch(@CurrentActor() actor: Actor): Promise<PortfolioAtRiskPerBranchAnswer> {
    const result = await this.queries.execute(new PortfolioAtRiskPerBranchQuery(actor));

    return toAnswer(result);
  }
}

/** Only the fields of the public contract leave the context: each branch line as it is declared. */
function toAnswer(result: PortfolioAtRiskPerBranchResult): PortfolioAtRiskPerBranchAnswer {
  return {
    branches: result.branches.map((branch) => ({
      branchId: branch.branchId,
      paidOutCents: branch.paidOutCents,
      oneToThirtyDaysCents: branch.oneToThirtyDaysCents,
      thirtyOneToSixtyDaysCents: branch.thirtyOneToSixtyDaysCents,
      sixtyOneToNinetyDaysCents: branch.sixtyOneToNinetyDaysCents,
      overNinetyDaysCents: branch.overNinetyDaysCents,
      atRiskCents: branch.atRiskCents,
      portfolioAtRiskBasisPoints: branch.portfolioAtRiskBasisPoints,
    })),
  };
}
