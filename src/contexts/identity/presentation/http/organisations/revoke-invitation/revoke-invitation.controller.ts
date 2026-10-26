import { Controller, Delete, Inject, Param } from '@nestjs/common';
import type { Accepted } from '@ddd-ts-kit/http';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { RevokeInvitationCommand } from '@/contexts/identity/application/commands/revoke-invitation/revoke-invitation.command';
import { RevokeInvitationParams } from '@/contexts/identity/presentation/http/organisations/revoke-invitation/revoke-invitation.params';
import { OrganisationsRoutes } from '@/contexts/identity/presentation/http/organisations.routes';

/** Built by Nest with the bus it injects, served by the kit: its parts and its answer are read from its signature. */
@Controller()
@KitRoutes({ group: OrganisationsRoutes })
export class RevokeInvitationController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Delete(':organisationId/invitations/:invitationId')
  @KitRoute({
    summary: 'Take back an invitation',
    response: { description: 'Taken back; the body carries its identifier.' },
    errors: ['INVITATION_NOT_FOUND', 'INVITATION_NOT_PENDING'],
  })
  async revokeInvitation(@Param() params: RevokeInvitationParams, @CurrentActor() actor: Actor): Promise<Accepted> {
    const id = await this.commands.execute(
      new RevokeInvitationCommand(actor, params.organisationId, params.invitationId),
    );

    return { id };
  }
}
