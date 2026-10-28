import { Controller, Get, Inject, Param } from '@nestjs/common';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { QueryBus, type Actor } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';
import { ReadPreContractualSheetQuery } from '@/contexts/credit-application/offer/application/queries/read-pre-contractual-sheet/read-pre-contractual-sheet.query';
import { OffersRoutes } from '@/contexts/credit-application/presentation/http/offers.routes';
import { ReadPreContractualSheetParams } from '@/contexts/credit-application/offer/presentation/http/offers/read-pre-contractual-sheet/read-pre-contractual-sheet.params';
import { ReadPreContractualSheetAnswer } from '@/contexts/credit-application/offer/presentation/http/offers/read-pre-contractual-sheet/read-pre-contractual-sheet.answer';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: OffersRoutes })
export class ReadPreContractualSheetController {
  constructor(@Inject(QueryBus) private readonly queries: QueryBus) {}

  @Get(':id/pre-contractual-sheet')
  @KitRoute({
    errors: [CreditApplicationCodes.UnknownOffer],
  })
  async readPreContractualSheet(
    @Param() params: ReadPreContractualSheetParams,
    @CurrentActor() actor: Actor,
  ): Promise<ReadPreContractualSheetAnswer> {
    return this.queries.execute(new ReadPreContractualSheetQuery(actor, params.id));
  }
}
