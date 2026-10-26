import { Controller, Delete, Inject, Param } from '@nestjs/common';
import type { Accepted } from '@ddd-ts-kit/http';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { RemoveMemberCommand } from '@/contexts/identity/application/commands/remove-member/remove-member.command';
import { RemoveMemberParams } from '@/contexts/identity/presentation/http/organisations/remove-member/remove-member.params';
import { OrganisationsRoutes } from '@/contexts/identity/presentation/http/organisations.routes';

/** Built by Nest with the bus it injects, served by the kit: its parts and its answer are read from its signature. */
@Controller()
@KitRoutes({ group: OrganisationsRoutes })
export class RemoveMemberController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Delete(':organisationId/members/:accountId')
  @KitRoute({
    summary: 'Remove a member',
    response: { description: 'Removed; the body carries the identifier of the membership.' },
    errors: ['ORGANISATION_NOT_FOUND', 'MEMBER_NOT_FOUND', 'ABOVE_OWN_ROLE', 'OWNERS_ONLY', 'LAST_OWNER'],
  })
  async removeMember(@Param() params: RemoveMemberParams, @CurrentActor() actor: Actor): Promise<Accepted> {
    const id = await this.commands.execute(new RemoveMemberCommand(actor, params.organisationId, params.accountId));

    return { id };
  }
}
