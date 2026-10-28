import { Controller, Get, Inject, Param } from '@nestjs/common';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { QueryBus, type Actor } from '@ddd-ts-kit/kernel';
import { GetCustomerDueDiligenceQuery } from '@/contexts/customer-due-diligence/application/queries/get-customer-due-diligence/get-customer-due-diligence.query';
import { CustomersRoutes } from '@/contexts/customer-due-diligence/presentation/http/customers.routes';
import { GetCustomerDueDiligenceParams } from '@/contexts/customer-due-diligence/presentation/http/customers/get-customer-due-diligence/get-customer-due-diligence.params';
import { GetCustomerDueDiligenceAnswer } from '@/contexts/customer-due-diligence/presentation/http/customers/get-customer-due-diligence/get-customer-due-diligence.answer';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: CustomersRoutes })
export class GetCustomerDueDiligenceController {
  constructor(@Inject(QueryBus) private readonly queries: QueryBus) {}

  @Get(':id/due-diligence')
  @KitRoute({
    summary:
      'Get the date of the last refresh of the due diligence of a customer and the date it falls due again, when the caller may read it',
    errors: ['UNKNOWN_CUSTOMER'],
  })
  async getCustomerDueDiligence(
    @Param() params: GetCustomerDueDiligenceParams,
    @CurrentActor() actor: Actor,
  ): Promise<GetCustomerDueDiligenceAnswer> {
    return this.queries.execute(new GetCustomerDueDiligenceQuery(actor, params.id));
  }
}
