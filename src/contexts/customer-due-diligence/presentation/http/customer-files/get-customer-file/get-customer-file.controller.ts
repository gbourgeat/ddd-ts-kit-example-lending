import { Controller, Get, Inject, Query } from '@nestjs/common';
import { pageQuerySchema, pageResponse, pageSchemaOf, type PageBody } from '@ddd-ts-kit/http';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { QueryBus, type Actor } from '@ddd-ts-kit/kernel';
import type { Infer } from '@ddd-ts-kit/validation';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { GetCustomerFileQuery } from '@/contexts/customer-due-diligence/application/queries/get-customer-file/get-customer-file.query';
import { CustomerFilesRoutes } from '@/contexts/customer-due-diligence/presentation/http/customer-files.routes';
import { GetCustomerFileLine } from '@/contexts/customer-due-diligence/presentation/http/customer-files/get-customer-file/get-customer-file.line';

// TODO(domain): list here the fields of GetCustomerFileSort a client may sort by, and bound the size of a page.
const query = pageQuerySchema({ sortable: ['id'], maxSize: 100 });
const line = classSchema(GetCustomerFileLine);

/** Built by Nest with the bus it injects, served by the kit: a page is no DTO class, so @KitRoute gives its query and its answer. */
@Controller()
@KitRoutes({ group: CustomerFilesRoutes })
export class GetCustomerFileController {
  constructor(@Inject(QueryBus) private readonly queries: QueryBus) {}

  @Get()
  @KitRoute({
    request: { query },
    response: { description: 'One page of the search.', body: pageSchemaOf(line) },
    // TODO(domain): list the codes of the refusals "get customer file" can raise, as their factories set them, so that they appear in the contract with their status (`errors/known-code`).
    errors: [],
  })
  async getCustomerFile(
    @Query() criteria: Infer<typeof query>,
    @CurrentActor() actor: Actor,
  ): Promise<PageBody<Infer<typeof line>>> {
    // TODO(domain): hand the criteria of the query over too, once the query schema declares them next to the page; map each line to its public fields.
    const page = await this.queries.execute(new GetCustomerFileQuery(actor, criteria));

    return pageResponse(page, (getCustomerFile) => ({ id: getCustomerFile.id }));
  }
}
