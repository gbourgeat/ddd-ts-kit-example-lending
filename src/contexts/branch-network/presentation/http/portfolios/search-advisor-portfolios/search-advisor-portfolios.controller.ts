import { Controller, Get, Inject, Query } from '@nestjs/common';
import { pageQuerySchema, pageResponse, pageSchemaOf, type PageBody } from '@ddd-ts-kit/http';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { QueryBus, type Actor } from '@ddd-ts-kit/kernel';
import type { Infer } from '@ddd-ts-kit/validation';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { SearchAdvisorPortfoliosQuery } from '@/contexts/branch-network/application/queries/search-advisor-portfolios/search-advisor-portfolios.query';
import { PortfoliosRoutes } from '@/contexts/branch-network/presentation/http/portfolios.routes';
import { SearchAdvisorPortfoliosLine } from '@/contexts/branch-network/presentation/http/portfolios/search-advisor-portfolios/search-advisor-portfolios.line';

const query = pageQuerySchema({ sortable: ['id'], maxSize: 100 });
const line = classSchema(SearchAdvisorPortfoliosLine);

/** Built by Nest with the bus it injects, served by the kit: a page is no DTO class, so @KitRoute gives its query and its answer. */
@Controller()
@KitRoutes({ group: PortfoliosRoutes })
export class SearchAdvisorPortfoliosController {
  constructor(@Inject(QueryBus) private readonly queries: QueryBus) {}

  @Get()
  @KitRoute({
    request: { query },
    response: { description: 'One page of the portfolios the signed-in advisor holds.', body: pageSchemaOf(line) },
    errors: [],
  })
  async searchAdvisorPortfolios(
    @Query() criteria: Infer<typeof query>,
    @CurrentActor() actor: Actor,
  ): Promise<PageBody<Infer<typeof line>>> {
    const page = await this.queries.execute(new SearchAdvisorPortfoliosQuery(actor, criteria));

    return pageResponse(page, (advisorPortfolio) => ({ id: advisorPortfolio.id }));
  }
}
