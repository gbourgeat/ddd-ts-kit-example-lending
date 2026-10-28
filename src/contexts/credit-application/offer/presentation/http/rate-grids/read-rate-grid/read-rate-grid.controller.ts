import { Controller, Get, Inject, Param } from '@nestjs/common';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { QueryBus, type Actor } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';
import { ReadRateGridQuery } from '@/contexts/credit-application/offer/application/queries/read-rate-grid/read-rate-grid.query';
import { RateGridsRoutes } from '@/contexts/credit-application/presentation/http/rate-grids.routes';
import { ReadRateGridParams } from '@/contexts/credit-application/offer/presentation/http/rate-grids/read-rate-grid/read-rate-grid.params';
import { ReadRateGridAnswer } from '@/contexts/credit-application/offer/presentation/http/rate-grids/read-rate-grid/read-rate-grid.answer';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: RateGridsRoutes })
export class ReadRateGridController {
  constructor(@Inject(QueryBus) private readonly queries: QueryBus) {}

  @Get(':rateGridId')
  @KitRoute({
    errors: [CreditApplicationCodes.UnknownRateGrid],
  })
  async readRateGrid(@Param() params: ReadRateGridParams, @CurrentActor() actor: Actor): Promise<ReadRateGridAnswer> {
    const rateGrid = await this.queries.execute(new ReadRateGridQuery(actor, params.rateGridId));

    return {
      rateGridId: rateGrid.rateGridId,
      productId: rateGrid.productId,
      effectiveFrom: rateGrid.effectiveFrom,
    };
  }
}
