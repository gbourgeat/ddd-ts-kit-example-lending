import { Body, Controller, Inject, Param, Post } from '@nestjs/common';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { InviteMemberCommand } from '@/contexts/identity/application/commands/invite-member/invite-member.command';
import { InviteMemberParams } from '@/contexts/identity/presentation/http/organisations/invite-member/invite-member.params';
import { InviteMemberBody } from '@/contexts/identity/presentation/http/organisations/invite-member/invite-member.body';
import { InviteMemberAccepted } from '@/contexts/identity/presentation/http/organisations/invite-member/invite-member.accepted';
import { OrganisationsRoutes } from '@/contexts/identity/presentation/http/organisations.routes';

/** Built by Nest with the bus it injects, served by the kit: its parts and its answer are read from its signature. */
@Controller()
@KitRoutes({ group: OrganisationsRoutes })
export class InviteMemberController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post(':organisationId/invitations')
  @KitRoute({
    summary: 'Invite a person to the organisation',
    response: { description: 'Issued; the body carries the token to send to the person, given once and never stored.' },
    errors: ['INVALID_EMAIL_ADDRESS', 'ABOVE_OWN_ROLE', 'OWNERS_ONLY'],
  })
  async inviteMember(
    @Param() params: InviteMemberParams,
    @Body() body: InviteMemberBody,
    @CurrentActor() actor: Actor,
  ): Promise<InviteMemberAccepted> {
    return this.commands.execute(new InviteMemberCommand(actor, params.organisationId, body));
  }
}
