import { Body, Controller, HttpCode, Inject, Post } from '@nestjs/common';
import type { Accepted } from '@ddd-ts-kit/http';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { AcceptInvitationCommand } from '@/contexts/identity/application/commands/accept-invitation/accept-invitation.command';
import { InvitationToken } from '@/contexts/identity/presentation/http/shared/invitation-token.schema';
import { InvitationsRoutes } from '@/contexts/identity/presentation/http/invitations.routes';

/** The token every invitation route reads, documented once under its name. */
const token = classSchema(InvitationToken, { shared: true });

/** Built by Nest with the bus it injects, served by the kit: its parts and its answer are read from its signature. */
@Controller()
@KitRoutes({ group: InvitationsRoutes })
export class AcceptInvitationController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post('acceptance')
  @HttpCode(200)
  @KitRoute({
    summary: 'Accept an invitation',
    request: { body: token },
    response: { description: 'Accepted; the caller is a member, the body carries the identifier of the invitation.' },
    errors: [
      'INVITATION_NOT_FOUND',
      'ACCOUNT_NOT_FOUND',
      'ACCOUNT_DEACTIVATED',
      'INVITATION_NOT_PENDING',
      'INVITATION_EXPIRED',
      'INVITATION_ADDRESSED_TO_ANOTHER',
      'ALREADY_MEMBER',
    ],
  })
  async acceptInvitation(@Body() body: InvitationToken, @CurrentActor() actor: Actor): Promise<Accepted> {
    const id = await this.commands.execute(new AcceptInvitationCommand(actor, body.token));

    return { id };
  }
}
