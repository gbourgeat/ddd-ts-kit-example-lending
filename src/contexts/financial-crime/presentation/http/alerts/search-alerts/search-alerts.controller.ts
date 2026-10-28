import { Controller, Get, Inject, Query } from '@nestjs/common';
import { pageQuerySchema, pageResponse, pageSchemaOf, type PageBody } from '@ddd-ts-kit/http';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { QueryBus, type Actor } from '@ddd-ts-kit/kernel';
import type { Infer } from '@ddd-ts-kit/validation';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { SearchAlertsQuery } from '@/contexts/financial-crime/application/queries/search-alerts/search-alerts.query';
import { AlertsRoutes } from '@/contexts/financial-crime/presentation/http/alerts.routes';
import { SearchAlertsLine } from '@/contexts/financial-crime/presentation/http/alerts/search-alerts/search-alerts.line';

const MAX_PAGE_SIZE = 100;

const query = pageQuerySchema({ sortable: ['id'], maxSize: MAX_PAGE_SIZE });
const line = classSchema(SearchAlertsLine);

/** Built by Nest with the bus it injects, served by the kit. Only the compliance officers get a page: any other caller is refused before the list. */
@Controller()
@KitRoutes({ group: AlertsRoutes })
export class SearchAlertsController {
  constructor(@Inject(QueryBus) private readonly queries: QueryBus) {}

  @Get()
  @KitRoute({
    request: { query },
    response: { description: 'One page of the alerts of the bank.', body: pageSchemaOf(line) },
    errors: [],
  })
  async searchAlerts(
    @Query() criteria: Infer<typeof query>,
    @CurrentActor() actor: Actor,
  ): Promise<PageBody<Infer<typeof line>>> {
    const page = await this.queries.execute(new SearchAlertsQuery(actor, criteria));

    return pageResponse(page, (alert) => ({ id: alert.id, repaymentReference: alert.repaymentReference }));
  }
}
