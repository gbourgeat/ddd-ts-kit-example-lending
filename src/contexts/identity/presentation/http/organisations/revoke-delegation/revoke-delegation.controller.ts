import { Controller, Delete, Inject, Param } from '@nestjs/common';
import type { Accepted } from '@ddd-ts-kit/http';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { RevokeDelegationCommand } from '@/contexts/identity/application/commands/revoke-delegation/revoke-delegation.command';
import { RevokeDelegationParams } from '@/contexts/identity/presentation/http/organisations/revoke-delegation/revoke-delegation.params';
import { OrganisationsRoutes } from '@/contexts/identity/presentation/http/organisations.routes';

/** Built by Nest with the bus it injects, served by the kit: its parts and its answer are read from its signature. */
@Controller()
@KitRoutes({ group: OrganisationsRoutes })
export class RevokeDelegationController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Delete(':organisationId/delegations/:delegationId')
  @KitRoute({
    summary: 'Revoke a delegation',
    response: { description: 'Revoked; the body carries its identifier.' },
    errors: ['DELEGATION_NOT_FOUND', 'DELEGATION_NOT_ACTIVE'],
  })
  async revokeDelegation(@Param() params: RevokeDelegationParams, @CurrentActor() actor: Actor): Promise<Accepted> {
    const id = await this.commands.execute(
      new RevokeDelegationCommand(actor, params.organisationId, params.delegationId),
    );

    return { id };
  }
}
