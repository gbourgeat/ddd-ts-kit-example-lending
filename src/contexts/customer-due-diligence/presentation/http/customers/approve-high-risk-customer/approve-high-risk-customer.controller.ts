import { Controller, Inject, Param, Post } from '@nestjs/common';
import { type Accepted } from '@ddd-ts-kit/http';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { ApproveHighRiskCustomerCommand } from '@/contexts/customer-due-diligence/application/commands/approve-high-risk-customer/approve-high-risk-customer.command';
import { CustomersRoutes } from '@/contexts/customer-due-diligence/presentation/http/customers.routes';
import { ApproveHighRiskCustomerParams } from '@/contexts/customer-due-diligence/presentation/http/customers/approve-high-risk-customer/approve-high-risk-customer.params';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: CustomersRoutes })
export class ApproveHighRiskCustomerController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post(':customerId/high-risk-approval')
  @KitRoute({
    summary: 'Approve a customer rated high risk, as compliance; a re-rating clears the approval',
    errors: ['UNKNOWN_CUSTOMER', 'CUSTOMER_NOT_HIGH_RISK'],
  })
  async approveHighRiskCustomer(
    @Param() params: ApproveHighRiskCustomerParams,
    @CurrentActor() actor: Actor,
  ): Promise<Accepted> {
    const id = await this.commands.execute(new ApproveHighRiskCustomerCommand(actor, params.customerId));

    return { id };
  }
}
