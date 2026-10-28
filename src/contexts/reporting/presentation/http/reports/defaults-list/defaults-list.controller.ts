import { Controller, Get, Inject } from '@nestjs/common';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { QueryBus, type Actor } from '@ddd-ts-kit/kernel';
import { DefaultsListQuery } from '@/contexts/reporting/application/queries/defaults-list/defaults-list.query';
import type { DefaultsListResult } from '@/contexts/reporting/application/queries/defaults-list/defaults-list.result';
import { ReportsRoutes } from '@/contexts/reporting/presentation/http/reports.routes';
import { DefaultsListAnswer } from '@/contexts/reporting/presentation/http/reports/defaults-list/defaults-list.answer';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: ReportsRoutes })
export class DefaultsListController {
  constructor(@Inject(QueryBus) private readonly queries: QueryBus) {}

  /** The list is the context itself: its refusals are the permission of the group's guards, none of its own. */
  @Get('defaults')
  @KitRoute({
    produces: ['text/csv'],
    errors: [],
  })
  async defaultsList(@CurrentActor() actor: Actor): Promise<DefaultsListAnswer> {
    const result = await this.queries.execute(new DefaultsListQuery(actor));

    return toAnswer(result);
  }
}

/** Only the fields of the public contract leave the context: each loan line as it is declared. */
function toAnswer(result: DefaultsListResult): DefaultsListAnswer {
  return {
    items: result.loans.map((loan) => ({
      loanId: loan.loanId,
      branchId: loan.branchId,
      principalCents: loan.principalCents,
      defaultedAt: loan.defaultedAt,
    })),
  };
}
