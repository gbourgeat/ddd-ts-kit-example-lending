import { Controller, Get, Inject } from '@nestjs/common';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { QueryBus, type Actor } from '@ddd-ts-kit/kernel';
import { DefaultedLoansQuery } from '@/contexts/reporting/application/queries/defaulted-loans/defaulted-loans.query';
import type { DefaultedLoansResult } from '@/contexts/reporting/application/queries/defaulted-loans/defaulted-loans.result';
import { ReportsRoutes } from '@/contexts/reporting/presentation/http/reports.routes';
import { DefaultedLoansAnswer } from '@/contexts/reporting/presentation/http/reports/defaulted-loans/defaulted-loans.answer';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: ReportsRoutes })
export class DefaultedLoansController {
  constructor(@Inject(QueryBus) private readonly queries: QueryBus) {}

  /** The list is the context itself: its refusals are the permission of the group's guards, none of its own. */
  @Get('defaulted-loans')
  @KitRoute({
    errors: [],
  })
  async defaultedLoans(@CurrentActor() actor: Actor): Promise<DefaultedLoansAnswer> {
    const result = await this.queries.execute(new DefaultedLoansQuery(actor));

    return toAnswer(result);
  }
}

/** Only the fields of the public contract leave the context: each loan line as it is declared. */
function toAnswer(result: DefaultedLoansResult): DefaultedLoansAnswer {
  return {
    loans: result.loans.map((loan) => ({
      loanId: loan.loanId,
      branchId: loan.branchId,
      principalCents: loan.principalCents,
      defaultedAt: loan.defaultedAt,
    })),
  };
}
