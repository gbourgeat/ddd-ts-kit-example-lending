import { Controller, Get, Inject } from '@nestjs/common';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { QueryBus, type Actor } from '@ddd-ts-kit/kernel';
import { ReadPortfolioAtRiskQuery } from '@/contexts/servicing/arrears/application/queries/read-portfolio-at-risk/read-portfolio-at-risk.query';
import { LoansRoutes } from '@/contexts/servicing/presentation/http/loans.routes';
import { ReadPortfolioAtRiskAnswer } from '@/contexts/servicing/arrears/presentation/http/loans/read-portfolio-at-risk/read-portfolio-at-risk.answer';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: LoansRoutes })
export class ReadPortfolioAtRiskController {
  constructor(@Inject(QueryBus) private readonly queries: QueryBus) {}

  @Get('portfolio-at-risk')
  @KitRoute({
    errors: [],
  })
  async readPortfolioAtRisk(@CurrentActor() actor: Actor): Promise<ReadPortfolioAtRiskAnswer> {
    const result = await this.queries.execute(new ReadPortfolioAtRiskQuery(actor));

    return {
      buckets: result.buckets.map((bucket) => ({ ...bucket })),
      openPrincipalCents: result.openPrincipalCents,
      atRiskBasisPoints: result.atRiskBasisPoints,
    };
  }
}
