import { Controller, Get, Inject, Param } from '@nestjs/common';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { QueryBus, type Actor } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';
import { ReadProductTermsQuery } from '@/contexts/credit-application/file/application/queries/read-product-terms/read-product-terms.query';
import { ProductTermsRoutes } from '@/contexts/credit-application/presentation/http/product-terms.routes';
import { ReadProductTermsParams } from '@/contexts/credit-application/file/presentation/http/product-terms/read-product-terms/read-product-terms.params';
import { ReadProductTermsAnswer } from '@/contexts/credit-application/file/presentation/http/product-terms/read-product-terms/read-product-terms.answer';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: ProductTermsRoutes })
export class ReadProductTermsController {
  constructor(@Inject(QueryBus) private readonly queries: QueryBus) {}

  @Get(':productId')
  @KitRoute({
    errors: [CreditApplicationCodes.UnknownProductTerms],
  })
  async readProductTerms(
    @Param() params: ReadProductTermsParams,
    @CurrentActor() actor: Actor,
  ): Promise<ReadProductTermsAnswer> {
    const terms = await this.queries.execute(new ReadProductTermsQuery(actor, params.productId));

    return {
      productId: terms.productId,
      amountMinimumCents: terms.amountMinimumCents,
      amountMaximumCents: terms.amountMaximumCents,
      durationMinimumMonths: terms.durationMinimumMonths,
      durationMaximumMonths: terms.durationMaximumMonths,
      arrangementFeeCents: terms.arrangementFeeCents,
      insuranceMandatory: terms.insuranceMandatory,
    };
  }
}
