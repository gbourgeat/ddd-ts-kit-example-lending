import { Controller, Get, Inject, Param } from '@nestjs/common';
import { CacheScope } from '@ddd-ts-kit/http';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { QueryBus, type Actor } from '@ddd-ts-kit/kernel';
import { ReadProductTermsFindingsQuery } from '@/contexts/credit-application/file/application/queries/read-product-terms-findings/read-product-terms-findings.query';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';
import { ApplicationsRoutes } from '@/contexts/credit-application/presentation/http/applications.routes';
import { ReadProductTermsFindingsParams } from '@/contexts/credit-application/file/presentation/http/applications/read-product-terms-findings/read-product-terms-findings.params';
import { ReadProductTermsFindingsAnswer } from '@/contexts/credit-application/file/presentation/http/applications/read-product-terms-findings/read-product-terms-findings.answer';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: ApplicationsRoutes })
export class ReadProductTermsFindingsController {
  constructor(@Inject(QueryBus) private readonly queries: QueryBus) {}

  @Get(':id/product-terms-findings')
  @KitRoute({
    summary: 'Read what the check of an application against its product found',
    errors: [CreditApplicationCodes.UnknownCreditApplication],
    cache: { scope: CacheScope.noStore },
  })
  async readProductTermsFindings(
    @Param() params: ReadProductTermsFindingsParams,
    @CurrentActor() actor: Actor,
  ): Promise<ReadProductTermsFindingsAnswer> {
    const { findings } = await this.queries.execute(new ReadProductTermsFindingsQuery(actor, params.id));

    return { findings: findings.map((finding) => ({ ...finding })) };
  }
}
