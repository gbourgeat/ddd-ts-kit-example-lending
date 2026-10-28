import { Controller, Inject, Param, Post } from '@nestjs/common';
import { type Accepted } from '@ddd-ts-kit/http';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { FlagOverdueDueDiligenceCommand } from '@/contexts/customer-due-diligence/application/commands/flag-overdue-due-diligence/flag-overdue-due-diligence.command';
import { CustomersRoutes } from '@/contexts/customer-due-diligence/presentation/http/customers.routes';
import { FlagOverdueDueDiligenceParams } from '@/contexts/customer-due-diligence/presentation/http/customers/flag-overdue-due-diligence/flag-overdue-due-diligence.params';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: CustomersRoutes })
export class FlagOverdueDueDiligenceController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post(':customerId/due-diligence/flag-overdue')
  @KitRoute({
    summary: 'Flag the due diligence of a customer as overdue when its refresh is past its date',
    errors: ['UNKNOWN_CUSTOMER'],
  })
  async flagOverdueDueDiligence(
    @Param() params: FlagOverdueDueDiligenceParams,
    @CurrentActor() actor: Actor,
  ): Promise<Accepted> {
    const id = await this.commands.execute(new FlagOverdueDueDiligenceCommand(actor, params.customerId));

    return { id };
  }
}
