import { Body, Controller, HttpCode, Inject, Post } from '@nestjs/common';
import type { Accepted } from '@ddd-ts-kit/http';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { DeclineInvitationCommand } from '@/contexts/identity/application/commands/decline-invitation/decline-invitation.command';
import { InvitationToken } from '@/contexts/identity/presentation/http/shared/invitation-token.schema';
import { InvitationsRoutes } from '@/contexts/identity/presentation/http/invitations.routes';

/** The token every invitation route reads, documented once under its name. */
const token = classSchema(InvitationToken, { shared: true });

/** Built by Nest with the bus it injects, served by the kit: its parts and its answer are read from its signature. */
@Controller()
@KitRoutes({ group: InvitationsRoutes })
export class DeclineInvitationController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post('declination')
  @HttpCode(200)
  @KitRoute({
    summary: 'Decline an invitation',
    request: { body: token },
    response: { description: 'Declined; the body carries the identifier of the invitation.' },
    errors: [
      'INVITATION_NOT_FOUND',
      'ACCOUNT_NOT_FOUND',
      'INVITATION_NOT_PENDING',
      'INVITATION_EXPIRED',
      'INVITATION_ADDRESSED_TO_ANOTHER',
    ],
  })
  async declineInvitation(@Body() body: InvitationToken, @CurrentActor() actor: Actor): Promise<Accepted> {
    const id = await this.commands.execute(new DeclineInvitationCommand(actor, body.token));

    return { id };
  }
}
