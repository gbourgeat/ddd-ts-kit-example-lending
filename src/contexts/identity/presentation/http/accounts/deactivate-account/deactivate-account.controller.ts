import { Controller, HttpCode, Inject, Post } from '@nestjs/common';
import type { Accepted } from '@ddd-ts-kit/http';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { DeactivateAccountCommand } from '@/contexts/identity/application/commands/deactivate-account/deactivate-account.command';
import { AccountsRoutes } from '@/contexts/identity/presentation/http/accounts.routes';

/** Built by Nest with the bus it injects, served by the kit: its parts and its answer are read from its signature. */
@Controller()
@KitRoutes({ group: AccountsRoutes })
export class DeactivateAccountController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post('me/deactivation')
  @HttpCode(200)
  @KitRoute({
    summary: 'Deactivate my account',
    response: { description: 'The account is deactivated; the body carries its identifier.' },
    errors: ['ACCOUNT_NOT_FOUND', 'ACCOUNT_ALREADY_DEACTIVATED', 'ORGANISATION_NOT_FOUND', 'LAST_OWNER'],
  })
  async deactivateAccount(@CurrentActor() actor: Actor): Promise<Accepted> {
    const id = await this.commands.execute(new DeactivateAccountCommand(actor));

    return { id };
  }
}
