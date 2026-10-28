import { Body, Controller, Inject, Param, Put } from '@nestjs/common';
import { type Accepted } from '@ddd-ts-kit/http';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { RateCustomerRiskCommand } from '@/contexts/customer-due-diligence/application/commands/rate-customer-risk/rate-customer-risk.command';
import { CustomersRoutes } from '@/contexts/customer-due-diligence/presentation/http/customers.routes';
import { RateCustomerRiskParams } from '@/contexts/customer-due-diligence/presentation/http/customers/rate-customer-risk/rate-customer-risk.params';
import { RateCustomerRiskBody } from '@/contexts/customer-due-diligence/presentation/http/customers/rate-customer-risk/rate-customer-risk.body';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: CustomersRoutes })
export class RateCustomerRiskController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Put(':id/risk')
  @KitRoute({
    summary: 'Rate the risk of a customer, low, medium or high',
    errors: ['UNKNOWN_CUSTOMER'],
  })
  async rateCustomerRisk(
    @Param() params: RateCustomerRiskParams,
    @Body() body: RateCustomerRiskBody,
    @CurrentActor() actor: Actor,
  ): Promise<Accepted> {
    const id = await this.commands.execute(new RateCustomerRiskCommand(actor, params.id, body.rating));

    return { id };
  }
}
