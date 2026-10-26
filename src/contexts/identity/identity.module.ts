import type { UseCaseDeclaration } from '@ddd-ts-kit/auth';
import type { Type } from '@nestjs/common';
import { identityControllers } from '@/contexts/identity/identity.controllers';
import type { Route } from '@ddd-ts-kit/http';
import type { Actored, DomainEvent, Message } from '@ddd-ts-kit/kernel';
import type { Platform } from '@/platform/composition/platform';
// ddd-ts-kit:imports
import { requires, type RequirementOptions } from '@ddd-ts-kit/auth';
import { on, subscribeAll } from '@ddd-ts-kit/events';
import { identityPermissions } from '@/contexts/identity/identity.permissions';
import { PrismaAccountRepository } from '@/contexts/identity/infrastructure/persistence/prisma-account.repository';
import { PrismaOrganisationRepository } from '@/contexts/identity/infrastructure/persistence/prisma-organisation.repository';
import { PrismaMemberRepository } from '@/contexts/identity/infrastructure/persistence/prisma-member.repository';
import { PrismaInvitationRepository } from '@/contexts/identity/infrastructure/persistence/prisma-invitation.repository';
import { PrismaDelegationRepository } from '@/contexts/identity/infrastructure/persistence/prisma-delegation.repository';
import { PrismaSearchMembersReader } from '@/contexts/identity/infrastructure/persistence/prisma-search-members-reader.repository';
import { CryptoInvitationTokens } from '@/contexts/identity/infrastructure/external/crypto-invitation-tokens.adapter';
import { EnvironmentIdentityProviderConnection } from '@/contexts/identity/infrastructure/external/environment-identity-provider-connection.adapter';
import { KeycloakIdentityProviderAdmin } from '@/contexts/identity/infrastructure/external/keycloak-identity-provider-admin.adapter';
import { AcceptInvitationCommand } from '@/contexts/identity/application/commands/accept-invitation/accept-invitation.command';
import { AcceptInvitationHandler } from '@/contexts/identity/application/commands/accept-invitation/accept-invitation.handler';
import { ChangeMemberRoleCommand } from '@/contexts/identity/application/commands/change-member-role/change-member-role.command';
import { ChangeMemberRoleHandler } from '@/contexts/identity/application/commands/change-member-role/change-member-role.handler';
import { DeactivateAccountCommand } from '@/contexts/identity/application/commands/deactivate-account/deactivate-account.command';
import { DeactivateAccountHandler } from '@/contexts/identity/application/commands/deactivate-account/deactivate-account.handler';
import { DeclineInvitationCommand } from '@/contexts/identity/application/commands/decline-invitation/decline-invitation.command';
import { DeclineInvitationHandler } from '@/contexts/identity/application/commands/decline-invitation/decline-invitation.handler';
import { GrantDelegationCommand } from '@/contexts/identity/application/commands/grant-delegation/grant-delegation.command';
import { GrantDelegationHandler } from '@/contexts/identity/application/commands/grant-delegation/grant-delegation.handler';
import { InviteMemberCommand } from '@/contexts/identity/application/commands/invite-member/invite-member.command';
import { InviteMemberHandler } from '@/contexts/identity/application/commands/invite-member/invite-member.handler';
import { OpenOrganisationCommand } from '@/contexts/identity/application/commands/open-organisation/open-organisation.command';
import { OpenOrganisationHandler } from '@/contexts/identity/application/commands/open-organisation/open-organisation.handler';
import { ProvisionAccountCommand } from '@/contexts/identity/application/commands/provision-account/provision-account.command';
import { ProvisionAccountHandler } from '@/contexts/identity/application/commands/provision-account/provision-account.handler';
import { RemoveMemberCommand } from '@/contexts/identity/application/commands/remove-member/remove-member.command';
import { RemoveMemberHandler } from '@/contexts/identity/application/commands/remove-member/remove-member.handler';
import { RevokeDelegationCommand } from '@/contexts/identity/application/commands/revoke-delegation/revoke-delegation.command';
import { RevokeDelegationHandler } from '@/contexts/identity/application/commands/revoke-delegation/revoke-delegation.handler';
import { RevokeInvitationCommand } from '@/contexts/identity/application/commands/revoke-invitation/revoke-invitation.command';
import { RevokeInvitationHandler } from '@/contexts/identity/application/commands/revoke-invitation/revoke-invitation.handler';
import { SearchMembersQuery } from '@/contexts/identity/application/queries/search-members/search-members.query';
import { SearchMembersHandler } from '@/contexts/identity/application/queries/search-members/search-members.handler';
import { AccountDeactivatedIntegrationHandler } from '@/contexts/identity/application/integration/handlers/account-deactivated.integration-handler';
import { accountDeactivatedV1 } from '@/contexts/identity/published-language/account-deactivated.v1.integration-event';
import { MemberJoinedIntegrationHandler } from '@/contexts/identity/application/integration/handlers/member-joined.integration-handler';
import { memberJoinedV1 } from '@/contexts/identity/published-language/member-joined.v1.integration-event';
import { MemberRemovedIntegrationHandler } from '@/contexts/identity/application/integration/handlers/member-removed.integration-handler';
import { memberRemovedV1 } from '@/contexts/identity/published-language/member-removed.v1.integration-event';
import { OrganisationOpenedIntegrationHandler } from '@/contexts/identity/application/integration/handlers/organisation-opened.integration-handler';
import { organisationOpenedV1 } from '@/contexts/identity/published-language/organisation-opened.v1.integration-event';
import { AccountDeactivatedPublisher } from '@/contexts/identity/application/integration/publishers/account-deactivated.publisher';
import { AccountDeactivated } from '@/contexts/identity/domain/events/account-deactivated.event';
import { OrganisationOpenedPublisher } from '@/contexts/identity/application/integration/publishers/organisation-opened.publisher';
import { OrganisationOpened } from '@/contexts/identity/domain/events/organisation-opened.event';
import { MemberJoinedPublisher } from '@/contexts/identity/application/integration/publishers/member-joined.publisher';
import { MemberJoined } from '@/contexts/identity/domain/events/member-joined.event';
import { MemberRoleChangedPublisher } from '@/contexts/identity/application/integration/publishers/member-role-changed.publisher';
import { MemberRoleChanged } from '@/contexts/identity/domain/events/member-role-changed.event';
import { MemberRemovedPublisher } from '@/contexts/identity/application/integration/publishers/member-removed.publisher';
import { MemberRemoved } from '@/contexts/identity/domain/events/member-removed.event';
import { DelegationGrantedPublisher } from '@/contexts/identity/application/integration/publishers/delegation-granted.publisher';
import { DelegationGranted } from '@/contexts/identity/domain/events/delegation-granted.event';
import { DelegationRevokedPublisher } from '@/contexts/identity/application/integration/publishers/delegation-revoked.publisher';
import { DelegationRevoked } from '@/contexts/identity/domain/events/delegation-revoked.event';
// /ddd-ts-kit:imports

export interface IdentityWiring {
  readonly name: string;
  readonly useCases: readonly UseCaseDeclaration[];
  readonly routes: readonly Route[];
  /** Its Nest controllers, listed by the generated `identity.controllers.ts`: Nest builds them, the kit serves their methods. */
  readonly controllers: readonly Type<unknown>[];
}

/** Every use case of the context is asked of the context as a whole: inside an organisation, its policies decide. */
const IN_THE_CONTEXT: RequirementOptions<Message & Actored> = { resource: () => ({ type: 'context', id: 'identity' }) };

/**
 * What the declarations of the context say in the declared style: its adapters, its use cases,
 * the facts it publishes, the consumers that keep the identity provider in line, and its routes.
 */
export function identityModule(platform: Platform): IdentityWiring {
  const adapters = adaptersOf(platform);

  registerAccountsAndOrganisations(platform, adapters);
  registerInvitations(platform, adapters);
  registerMembersAndDelegations(platform, adapters);
  publishTheFacts(platform);
  keepTheProviderInLine(platform, adapters);
  // ddd-ts-kit:registrations
  // /ddd-ts-kit:registrations

  return {
    name: 'identity',
    useCases: [
      // ddd-ts-kit:authorization
      requires(AcceptInvitationCommand, identityPermissions['invitation.accept'], IN_THE_CONTEXT),
      requires(ChangeMemberRoleCommand, identityPermissions['member.change-role'], IN_THE_CONTEXT),
      requires(DeactivateAccountCommand, identityPermissions['account.deactivate'], IN_THE_CONTEXT),
      requires(DeclineInvitationCommand, identityPermissions['invitation.decline'], IN_THE_CONTEXT),
      requires(GrantDelegationCommand, identityPermissions['delegation.grant'], IN_THE_CONTEXT),
      requires(InviteMemberCommand, identityPermissions['member.invite'], IN_THE_CONTEXT),
      requires(OpenOrganisationCommand, identityPermissions['organisation.open'], IN_THE_CONTEXT),
      requires(ProvisionAccountCommand, identityPermissions['account.provision'], IN_THE_CONTEXT),
      requires(RemoveMemberCommand, identityPermissions['member.remove'], IN_THE_CONTEXT),
      requires(RevokeDelegationCommand, identityPermissions['delegation.revoke'], IN_THE_CONTEXT),
      requires(RevokeInvitationCommand, identityPermissions['invitation.revoke'], IN_THE_CONTEXT),
      requires(SearchMembersQuery, identityPermissions['member.search'], IN_THE_CONTEXT),
      // /ddd-ts-kit:authorization
    ],
    routes: [
      // ddd-ts-kit:routes
      // /ddd-ts-kit:routes
    ],
    controllers: identityControllers,
  };
}

/** The adapters of the ports of the context, each observed and protected by the platform. */
function adaptersOf(platform: Platform) {
  const { persistence, scope, clock } = platform;
  const as = (kind: 'repository' | 'external', token: string) => ({ kind, context: 'identity', token });
  const connection = new EnvironmentIdentityProviderConnection();

  return {
    accounts: platform.adapter(
      new PrismaAccountRepository(persistence.database, scope, clock),
      as('repository', 'AccountRepository'),
    ),
    organisations: platform.adapter(
      new PrismaOrganisationRepository(persistence.database, scope, clock),
      as('repository', 'OrganisationRepository'),
    ),
    members: platform.adapter(
      new PrismaMemberRepository(persistence.database, scope, clock),
      as('repository', 'MemberRepository'),
    ),
    invitations: platform.adapter(
      new PrismaInvitationRepository(persistence.database, scope, clock),
      as('repository', 'InvitationRepository'),
    ),
    delegations: platform.adapter(
      new PrismaDelegationRepository(persistence.database, scope, clock),
      as('repository', 'DelegationRepository'),
    ),
    reader: platform.adapter(
      new PrismaSearchMembersReader(persistence.database),
      as('repository', 'SearchMembersReader'),
    ),
    tokens: platform.adapter(new CryptoInvitationTokens(), as('external', 'InvitationTokens')),
    identityProvider: platform.adapter(
      new KeycloakIdentityProviderAdmin(connection),
      as('external', 'IdentityProviderAdmin'),
    ),
    access: platform.access,
  };
}

type Adapters = ReturnType<typeof adaptersOf>;

function registerAccountsAndOrganisations({ commands, ids, clock }: Platform, adapters: Adapters): void {
  const { accounts, organisations, members, delegations } = adapters;
  const own = { context: 'identity' };

  commands.register(ProvisionAccountCommand, new ProvisionAccountHandler(accounts, clock), own);

  commands.register(
    DeactivateAccountCommand,
    new DeactivateAccountHandler(accounts, organisations, members, delegations, clock),
    own,
  );

  commands.register(
    OpenOrganisationCommand,
    new OpenOrganisationHandler(organisations, members, accounts, ids, clock),
    own,
  );
}

function registerInvitations({ commands, ids, clock }: Platform, adapters: Adapters): void {
  const { accounts, members, invitations, delegations, tokens, access } = adapters;
  const own = { context: 'identity' };

  commands.register(
    InviteMemberCommand,
    new InviteMemberHandler(invitations, members, delegations, tokens, access, ids, clock),
    own,
  );

  commands.register(
    AcceptInvitationCommand,
    new AcceptInvitationHandler(invitations, members, accounts, tokens, ids, clock),
    own,
  );

  commands.register(DeclineInvitationCommand, new DeclineInvitationHandler(invitations, accounts, tokens, clock), own);

  commands.register(
    RevokeInvitationCommand,
    new RevokeInvitationHandler(invitations, members, delegations, access, clock),
    own,
  );
}

function registerMembersAndDelegations({ commands, queries, ids, clock }: Platform, adapters: Adapters): void {
  const { organisations, members, delegations, reader, access } = adapters;
  const own = { context: 'identity' };

  commands.register(
    ChangeMemberRoleCommand,
    new ChangeMemberRoleHandler(organisations, members, delegations, access, clock),
    own,
  );

  commands.register(
    RemoveMemberCommand,
    new RemoveMemberHandler(organisations, members, delegations, access, clock),
    own,
  );

  commands.register(GrantDelegationCommand, new GrantDelegationHandler(delegations, members, access, ids, clock), own);
  commands.register(RevokeDelegationCommand, new RevokeDelegationHandler(delegations, members, access, clock), own);
  queries.register(SearchMembersQuery, new SearchMembersHandler(reader, members, delegations, access, clock), own);
}

/** The facts the context announces, published as the integration events of its published language through the outbox. */
function publishTheFacts(platform: Platform): void {
  const { publisher, ids } = platform;

  announce(platform, AccountDeactivated, new AccountDeactivatedPublisher(publisher, ids));
  announce(platform, OrganisationOpened, new OrganisationOpenedPublisher(publisher, ids));
  announce(platform, MemberJoined, new MemberJoinedPublisher(publisher, ids));
  announce(platform, MemberRoleChanged, new MemberRoleChangedPublisher(publisher, ids));
  announce(platform, MemberRemoved, new MemberRemovedPublisher(publisher, ids));
  announce(platform, DelegationGranted, new DelegationGrantedPublisher(publisher, ids));
  announce(platform, DelegationRevoked, new DelegationRevokedPublisher(publisher, ids));
}

/** Hands the events of one class to their publisher, observed by the platform as a handler of the context. */
function announce<Fact extends DomainEvent>(
  platform: Platform,
  fact: (abstract new (...args: never[]) => Fact) & { readonly eventName: string },
  publisher: { handle(event: Fact): Promise<void> },
): void {
  const observed = platform.adapter(publisher, { kind: 'domain-event-handler', context: 'identity' });

  platform.domainEvents.on(fact.eventName, async (event) => {
    if (event instanceof fact) {
      await observed.handle(event);
    }
  });
}

/** The consumers that bring the identity provider in line with what the context publishes, each event handled once. */
function keepTheProviderInLine(platform: Platform, { members, identityProvider }: Adapters): void {
  const { processedEvents: processed, unitOfWork } = platform.persistence;
  const { scope } = platform;
  const accountDeactivatedIntegrationHandler = new AccountDeactivatedIntegrationHandler(identityProvider);
  const memberJoinedIntegrationHandler = new MemberJoinedIntegrationHandler(members, identityProvider);
  const memberRemovedIntegrationHandler = new MemberRemovedIntegrationHandler(members, identityProvider);
  const organisationOpenedIntegrationHandler = new OrganisationOpenedIntegrationHandler(identityProvider);

  subscribeAll(platform.subscriber, [
    on(accountDeactivatedV1, (event) => accountDeactivatedIntegrationHandler.handle(event), {
      consumer: 'identity.provider-disables-account',
      processed,
      unitOfWork,
      scope,
    }),
    on(memberJoinedV1, (event) => memberJoinedIntegrationHandler.handle(event), {
      consumer: 'identity.provider-follows-joined-member',
      processed,
      unitOfWork,
      scope,
    }),
    on(memberRemovedV1, (event) => memberRemovedIntegrationHandler.handle(event), {
      consumer: 'identity.provider-follows-removed-member',
      processed,
      unitOfWork,
      scope,
    }),
    on(organisationOpenedV1, (event) => organisationOpenedIntegrationHandler.handle(event), {
      consumer: 'identity.provider-opens-organisation',
      processed,
      unitOfWork,
      scope,
    }),
  ]);
}
