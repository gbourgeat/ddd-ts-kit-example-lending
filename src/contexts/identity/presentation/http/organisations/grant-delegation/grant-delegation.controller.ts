import { Body, Controller, Inject, Param, Post } from '@nestjs/common';
import type { Accepted } from '@ddd-ts-kit/http';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { GrantDelegationCommand } from '@/contexts/identity/application/commands/grant-delegation/grant-delegation.command';
import { GrantDelegationParams } from '@/contexts/identity/presentation/http/organisations/grant-delegation/grant-delegation.params';
import { GrantDelegationBody } from '@/contexts/identity/presentation/http/organisations/grant-delegation/grant-delegation.body';
import { OrganisationsRoutes } from '@/contexts/identity/presentation/http/organisations.routes';

/** Built by Nest with the bus it injects, served by the kit: its parts and its answer are read from its signature. */
@Controller()
@KitRoutes({ group: OrganisationsRoutes })
export class GrantDelegationController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post(':organisationId/delegations')
  @KitRoute({
    summary: 'Lend rights to a member',
    response: { description: 'Granted; the body carries the identifier of the delegation.' },
    errors: [
      'MEMBER_NOT_FOUND',
      'DELEGATION_TO_ONESELF',
      'DELEGATION_WITHOUT_RIGHTS',
      'DELEGATION_BEYOND_RIGHTS',
      'DELEGATION_PERIOD_INVERTED',
      'DELEGATION_TOO_LONG',
    ],
  })
  async grantDelegation(
    @Param() params: GrantDelegationParams,
    @Body() body: GrantDelegationBody,
    @CurrentActor() actor: Actor,
  ): Promise<Accepted> {
    const id = await this.commands.execute(new GrantDelegationCommand(actor, params.organisationId, termsOf(body)));

    return { id };
  }
}

function termsOf({ delegateId, rights, startsAt, endsAt }: GrantDelegationBody): GrantDelegationCommand['terms'] {
  return { delegateId, rights, startsAt: new Date(startsAt), endsAt: new Date(endsAt) };
}
