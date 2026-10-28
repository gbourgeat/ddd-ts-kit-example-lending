import { Body, Controller, Inject, Param, Post } from '@nestjs/common';
import { type Accepted } from '@ddd-ts-kit/http';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { DismissMatchCommand } from '@/contexts/customer-due-diligence/application/commands/dismiss-match/dismiss-match.command';
import { CustomersRoutes } from '@/contexts/customer-due-diligence/presentation/http/customers.routes';
import { DismissMatchParams } from '@/contexts/customer-due-diligence/presentation/http/customers/dismiss-match/dismiss-match.params';
import { DismissMatchBody } from '@/contexts/customer-due-diligence/presentation/http/customers/dismiss-match/dismiss-match.body';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: CustomersRoutes })
export class DismissMatchController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post(':id/matches/dismiss')
  @KitRoute({
    summary: 'Clear the possible match of a customer, with its reason, when compliance finds no sanctions match',
    errors: ['UNKNOWN_CUSTOMER', 'NO_POSSIBLE_MATCH'],
  })
  async dismissMatch(
    @Param() params: DismissMatchParams,
    @Body() body: DismissMatchBody,
    @CurrentActor() actor: Actor,
  ): Promise<Accepted> {
    const id = await this.commands.execute(new DismissMatchCommand(actor, params.id, body.reason));

    return { id };
  }
}
