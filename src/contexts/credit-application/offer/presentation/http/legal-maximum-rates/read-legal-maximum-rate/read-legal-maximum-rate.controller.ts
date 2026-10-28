import { Controller, Get, Inject, Param } from '@nestjs/common';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { QueryBus, type Actor } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';
import { ReadLegalMaximumRateQuery } from '@/contexts/credit-application/offer/application/queries/read-legal-maximum-rate/read-legal-maximum-rate.query';
import { LegalMaximumRatesRoutes } from '@/contexts/credit-application/presentation/http/legal-maximum-rates.routes';
import { ReadLegalMaximumRateParams } from '@/contexts/credit-application/offer/presentation/http/legal-maximum-rates/read-legal-maximum-rate/read-legal-maximum-rate.params';
import { ReadLegalMaximumRateAnswer } from '@/contexts/credit-application/offer/presentation/http/legal-maximum-rates/read-legal-maximum-rate/read-legal-maximum-rate.answer';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: LegalMaximumRatesRoutes })
export class ReadLegalMaximumRateController {
  constructor(@Inject(QueryBus) private readonly queries: QueryBus) {}

  @Get(':legalMaximumRateId')
  @KitRoute({
    errors: [CreditApplicationCodes.UnknownLegalMaximumRate],
  })
  async readLegalMaximumRate(
    @Param() params: ReadLegalMaximumRateParams,
    @CurrentActor() actor: Actor,
  ): Promise<ReadLegalMaximumRateAnswer> {
    const legalMaximumRate = await this.queries.execute(
      new ReadLegalMaximumRateQuery(actor, params.legalMaximumRateId),
    );

    return {
      legalMaximumRateId: legalMaximumRate.legalMaximumRateId,
      category: legalMaximumRate.category,
      rateBasisPoints: legalMaximumRate.rateBasisPoints,
      effectiveFrom: legalMaximumRate.effectiveFrom,
    };
  }
}
