import { Body, Controller, Inject, Param, Post } from '@nestjs/common';
import { type Accepted } from '@ddd-ts-kit/http';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { ScreenCustomerCommand } from '@/contexts/customer-due-diligence/application/commands/screen-customer/screen-customer.command';
import { CustomersRoutes } from '@/contexts/customer-due-diligence/presentation/http/customers.routes';
import { ScreenCustomerParams } from '@/contexts/customer-due-diligence/presentation/http/customers/screen-customer/screen-customer.params';
import { ScreenCustomerBody } from '@/contexts/customer-due-diligence/presentation/http/customers/screen-customer/screen-customer.body';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: CustomersRoutes })
export class ScreenCustomerController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post(':id/screening')
  @KitRoute({
    summary: 'Screen a customer against the sanctions and politically exposed lists',
    errors: ['UNKNOWN_CUSTOMER'],
  })
  async screenCustomer(
    @Param() params: ScreenCustomerParams,
    @Body() body: ScreenCustomerBody,
    @CurrentActor() actor: Actor,
  ): Promise<Accepted> {
    const id = await this.commands.execute(
      new ScreenCustomerCommand(actor, params.id, body.name, new Date(body.birthDate)),
    );

    return { id };
  }
}
