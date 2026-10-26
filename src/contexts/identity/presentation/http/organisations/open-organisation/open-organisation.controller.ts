import { Body, Controller, Inject, Post } from '@nestjs/common';
import type { Accepted } from '@ddd-ts-kit/http';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { OpenOrganisationCommand } from '@/contexts/identity/application/commands/open-organisation/open-organisation.command';
import { OpenOrganisationBody } from '@/contexts/identity/presentation/http/organisations/open-organisation/open-organisation.body';
import { OrganisationsRoutes } from '@/contexts/identity/presentation/http/organisations.routes';

/** Built by Nest with the bus it injects, served by the kit: its parts and its answer are read from its signature. */
@Controller()
@KitRoutes({ group: OrganisationsRoutes })
export class OpenOrganisationController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post()
  @KitRoute({
    summary: 'Open an organisation',
    response: { description: 'Opened; the body carries its slug, the caller is its first owner.' },
    errors: [
      'ACCOUNT_NOT_FOUND',
      'ACCOUNT_DEACTIVATED',
      'ORGANISATION_SLUG_TAKEN',
      'INVALID_ORGANISATION_SLUG',
      'INVALID_ORGANISATION_NAME',
    ],
  })
  async openOrganisation(@Body() body: OpenOrganisationBody, @CurrentActor() actor: Actor): Promise<Accepted> {
    const id = await this.commands.execute(new OpenOrganisationCommand(actor, body));

    return { id };
  }
}
