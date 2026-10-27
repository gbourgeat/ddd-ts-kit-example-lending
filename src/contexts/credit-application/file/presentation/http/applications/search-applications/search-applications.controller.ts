import { Controller, Get, Inject, Query } from '@nestjs/common';
import { pageQuerySchema, pageResponse, pageSchemaOf, type PageBody } from '@ddd-ts-kit/http';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { QueryBus, type Actor } from '@ddd-ts-kit/kernel';
import type { Infer } from '@ddd-ts-kit/validation';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { SearchApplicationsQuery } from '@/contexts/credit-application/file/application/queries/search-applications/search-applications.query';
import { ApplicationsRoutes } from '@/contexts/credit-application/presentation/http/applications.routes';
import { SearchApplicationsLine } from '@/contexts/credit-application/file/presentation/http/applications/search-applications/search-applications.line';

const MAX_PAGE_SIZE = 100;

const query = pageQuerySchema({ sortable: ['id'], maxSize: MAX_PAGE_SIZE });
const line = classSchema(SearchApplicationsLine);

/** Built by Nest with the bus it injects, served by the kit: a page is no DTO class, so @KitRoute gives its query and its answer. */
@Controller()
@KitRoutes({ group: ApplicationsRoutes })
export class SearchApplicationsController {
  constructor(@Inject(QueryBus) private readonly queries: QueryBus) {}

  @Get()
  @KitRoute({
    request: { query },
    response: { description: 'One page of the applications the caller may see.', body: pageSchemaOf(line) },
    // A list has no refusal of its own: what the caller may not see is not in the page.
    errors: [],
  })
  async searchApplications(
    @Query() criteria: Infer<typeof query>,
    @CurrentActor() actor: Actor,
  ): Promise<PageBody<Infer<typeof line>>> {
    const page = await this.queries.execute(new SearchApplicationsQuery(actor, criteria));

    return pageResponse(page, (application) => ({
      id: application.id,
      applicantId: application.applicantId,
      requestedAmountCents: application.requestedAmountCents,
      durationMonths: application.durationMonths,
    }));
  }
}
