import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { pageQuerySchema, pageResponse, pageSchemaOf, type PageBody } from '@ddd-ts-kit/http';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { QueryBus, type Actor } from '@ddd-ts-kit/kernel';
import type { Infer } from '@ddd-ts-kit/validation';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { BranchNetworkCodes } from '@/contexts/branch-network/branch-network.codes';
import { SearchPortfolioCustomersQuery } from '@/contexts/branch-network/application/queries/search-portfolio-customers/search-portfolio-customers.query';
import { PortfoliosRoutes } from '@/contexts/branch-network/presentation/http/portfolios.routes';
import { SearchPortfolioCustomersLine } from '@/contexts/branch-network/presentation/http/portfolios/search-portfolio-customers/search-portfolio-customers.line';
import { SearchPortfolioCustomersParams } from '@/contexts/branch-network/presentation/http/portfolios/search-portfolio-customers/search-portfolio-customers.params';

const query = pageQuerySchema({ sortable: ['id'], maxSize: 100 });
const line = classSchema(SearchPortfolioCustomersLine);

/** Built by Nest with the bus it injects, served by the kit: a page is no DTO class, so @KitRoute gives its query and its answer. */
@Controller()
@KitRoutes({ group: PortfoliosRoutes })
export class SearchPortfolioCustomersController {
  constructor(@Inject(QueryBus) private readonly queries: QueryBus) {}

  @Get(':id/customers')
  @KitRoute({
    request: { query },
    response: { description: 'One page of the customers of the portfolio.', body: pageSchemaOf(line) },
    errors: [BranchNetworkCodes.UnknownPortfolio],
  })
  async searchPortfolioCustomers(
    @Param() params: SearchPortfolioCustomersParams,
    @Query() criteria: Infer<typeof query>,
    @CurrentActor() actor: Actor,
  ): Promise<PageBody<Infer<typeof line>>> {
    const page = await this.queries.execute(new SearchPortfolioCustomersQuery(actor, criteria, params.id));

    return pageResponse(page, (customer) => ({ id: customer.id }));
  }
}
