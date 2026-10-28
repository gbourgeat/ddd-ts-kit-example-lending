import { Controller, Get, Inject, Param } from '@nestjs/common';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { QueryBus, type Actor } from '@ddd-ts-kit/kernel';
import { GetCustomerRiskRatingQuery } from '@/contexts/customer-due-diligence/application/queries/get-customer-risk-rating/get-customer-risk-rating.query';
import { CustomersRoutes } from '@/contexts/customer-due-diligence/presentation/http/customers.routes';
import { GetCustomerRiskRatingParams } from '@/contexts/customer-due-diligence/presentation/http/customers/get-customer-risk-rating/get-customer-risk-rating.params';
import { GetCustomerRiskRatingAnswer } from '@/contexts/customer-due-diligence/presentation/http/customers/get-customer-risk-rating/get-customer-risk-rating.answer';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: CustomersRoutes })
export class GetCustomerRiskRatingController {
  constructor(@Inject(QueryBus) private readonly queries: QueryBus) {}

  @Get(':id/risk-rating')
  @KitRoute({
    summary: 'Get the risk rating of a customer, low, medium or high, when the caller may read it',
    errors: [],
  })
  async getCustomerRiskRating(
    @Param() params: GetCustomerRiskRatingParams,
    @CurrentActor() actor: Actor,
  ): Promise<GetCustomerRiskRatingAnswer> {
    const result = await this.queries.execute(new GetCustomerRiskRatingQuery(actor, params.id));

    return result.riskRating === undefined
      ? { customerId: result.customerId }
      : { customerId: result.customerId, riskRating: result.riskRating };
  }
}
