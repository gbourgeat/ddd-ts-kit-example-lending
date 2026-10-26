import { describe, expect, it } from '@jest/globals';
import { nestControllerRoutes } from '@ddd-ts-kit/http/nest';
import { DuplicateHandlerError, type Command, type MessageType, type Query } from '@ddd-ts-kit/kernel';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { identityModule } from '@/contexts/identity/identity.module';
import { AcceptInvitationCommand } from '@/contexts/identity/application/commands/accept-invitation/accept-invitation.command';
import { ChangeMemberRoleCommand } from '@/contexts/identity/application/commands/change-member-role/change-member-role.command';
import { DeactivateAccountCommand } from '@/contexts/identity/application/commands/deactivate-account/deactivate-account.command';
import { DeclineInvitationCommand } from '@/contexts/identity/application/commands/decline-invitation/decline-invitation.command';
import { GrantDelegationCommand } from '@/contexts/identity/application/commands/grant-delegation/grant-delegation.command';
import { InviteMemberCommand } from '@/contexts/identity/application/commands/invite-member/invite-member.command';
import { OpenOrganisationCommand } from '@/contexts/identity/application/commands/open-organisation/open-organisation.command';
import { ProvisionAccountCommand } from '@/contexts/identity/application/commands/provision-account/provision-account.command';
import { RemoveMemberCommand } from '@/contexts/identity/application/commands/remove-member/remove-member.command';
import { RevokeDelegationCommand } from '@/contexts/identity/application/commands/revoke-delegation/revoke-delegation.command';
import { RevokeInvitationCommand } from '@/contexts/identity/application/commands/revoke-invitation/revoke-invitation.command';
import { SearchMembersQuery } from '@/contexts/identity/application/queries/search-members/search-members.query';
import { createPlatform } from '@/platform/composition/create-platform';
import { inertPersistence } from '@/platform/database/inert-persistence';
import { inProcessEvents } from '@/platform/events/in-process-events';

/**
 * The module of the context as the application composes it, on the platform: the specs of the use
 * cases run on the world of the context, this one holds the module to them, so that a use case
 * the module forgets, or a route it does not mount, fails here.
 */
const platform = createPlatform(inertPersistence(), { events: inProcessEvents() });
const wiring = identityModule(platform);

const USE_CASES = [
  command(AcceptInvitationCommand),
  command(ChangeMemberRoleCommand),
  command(DeactivateAccountCommand),
  command(DeclineInvitationCommand),
  command(GrantDelegationCommand),
  command(InviteMemberCommand),
  command(OpenOrganisationCommand),
  command(ProvisionAccountCommand),
  command(RemoveMemberCommand),
  command(RevokeDelegationCommand),
  command(RevokeInvitationCommand),
  query(SearchMembersQuery),
];

describe('The module of identity', () => {
  it.each(USE_CASES)('gives %s its handler', (_name, handled) => {
    expect(handled).toBe(true);
  });

  it('requires a permission of every use case of the context, and of nothing else', () => {
    const required = wiring.useCases.map(({ type }) => type.name).toSorted();

    expect(required).toEqual(USE_CASES.map(([name]) => name).toSorted());
  });

  it('mounts one route per use case of the context', () => {
    // The Nest controllers of the context, served by the kit: their routes as the application mounts them.
    const routes = nestControllerRoutes(wiring.controllers, { schemaOfClass: (dto) => classSchema(dto) });
    const mounted = routes.map(({ method, path }) => `${method} ${path}`).toSorted();

    expect(mounted).toEqual([
      'DELETE /organisations/:organisationId/delegations/:delegationId',
      'DELETE /organisations/:organisationId/invitations/:invitationId',
      'DELETE /organisations/:organisationId/members/:accountId',
      'GET /organisations/:organisationId/members',
      'POST /accounts/me/deactivation',
      'POST /invitations/acceptance',
      'POST /invitations/declination',
      'POST /organisations',
      'POST /organisations/:organisationId/delegations',
      'POST /organisations/:organisationId/invitations',
      'PUT /accounts/me',
      'PUT /organisations/:organisationId/members/:accountId/role',
    ]);
  });
});

function command<C extends Command<unknown>>(type: MessageType<C>) {
  return [type.name, alreadyHandled(() => platform.commands.register(type, { execute: never }))] as const;
}

function query<Q extends Query<unknown>>(type: MessageType<Q>) {
  return [type.name, alreadyHandled(() => platform.queries.register(type, { execute: never }))] as const;
}

/** Whether the bus already held a handler of the message: a second one is then refused as a duplicate. */
function alreadyHandled(register: () => unknown): boolean {
  try {
    register();

    return false;
  } catch (error) {
    return error instanceof DuplicateHandlerError;
  }
}

function never(): Promise<never> {
  return Promise.reject(new Error('A second handler is never run'));
}
