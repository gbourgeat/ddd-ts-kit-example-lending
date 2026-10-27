import { Controller, Inject, Param, Post } from '@nestjs/common';
import { type Accepted } from '@ddd-ts-kit/http';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { ConfirmSanctionsMatchCommand } from '@/contexts/customer-due-diligence/application/commands/confirm-sanctions-match/confirm-sanctions-match.command';
import { CustomersRoutes } from '@/contexts/customer-due-diligence/presentation/http/customers.routes';
import { ConfirmSanctionsMatchParams } from '@/contexts/customer-due-diligence/presentation/http/customers/confirm-sanctions-match/confirm-sanctions-match.params';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: CustomersRoutes })
export class ConfirmSanctionsMatchController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post(':id/matches/confirm')
  @KitRoute({
    summary: 'Confirm the possible match of a customer as a sanctions match, which ends the relationship',
    errors: ['UNKNOWN_CUSTOMER', 'NO_POSSIBLE_MATCH'],
  })
  async confirmSanctionsMatch(
    @Param() params: ConfirmSanctionsMatchParams,
    @CurrentActor() actor: Actor,
  ): Promise<Accepted> {
    const id = await this.commands.execute(new ConfirmSanctionsMatchCommand(actor, params.id));

    return { id };
  }
}
