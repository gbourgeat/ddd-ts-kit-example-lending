import { Controller, Get, Inject, Param } from '@nestjs/common';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { QueryBus, type Actor } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';
import { ReadDelegationTableQuery } from '@/contexts/credit-application/decision/application/queries/read-delegation-table/read-delegation-table.query';
import { DelegationTablesRoutes } from '@/contexts/credit-application/presentation/http/delegation-tables.routes';
import { ReadDelegationTableParams } from '@/contexts/credit-application/decision/presentation/http/delegation-tables/read-delegation-table/read-delegation-table.params';
import { ReadDelegationTableAnswer } from '@/contexts/credit-application/decision/presentation/http/delegation-tables/read-delegation-table/read-delegation-table.answer';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: DelegationTablesRoutes })
export class ReadDelegationTableController {
  constructor(@Inject(QueryBus) private readonly queries: QueryBus) {}

  @Get(':delegationTableId')
  @KitRoute({
    errors: [CreditApplicationCodes.UnknownDelegationTable],
  })
  async readDelegationTable(
    @Param() params: ReadDelegationTableParams,
    @CurrentActor() actor: Actor,
  ): Promise<ReadDelegationTableAnswer> {
    const delegationTable = await this.queries.execute(new ReadDelegationTableQuery(actor, params.delegationTableId));

    return {
      delegationTableId: delegationTable.delegationTableId,
      effectiveFrom: delegationTable.effectiveFrom,
      levels: delegationTable.levels.map((level) => ({ level: level.level, amountCents: level.amountCents })),
    };
  }
}
