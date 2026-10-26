import {
  AuthorizationMap,
  PolicyAccess,
  RoleBasedAuthorizer,
  authorizationMiddleware,
  requires,
  type Access,
} from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { on, subscribeAll } from '@ddd-ts-kit/events';
import { InMemoryProcessedEventStore, type Actor } from '@ddd-ts-kit/kernel';
import { createTestBuses, type TestBuses } from '@ddd-ts-kit/testing';
import { identityPermissions } from '@/contexts/identity/identity.permissions';
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
import { ChangeMemberRolesPolicy } from '@/contexts/identity/application/authorization/change-member-roles.policy';
import { GrantDelegationsPolicy } from '@/contexts/identity/application/authorization/grant-delegations.policy';
import { InviteMembersPolicy } from '@/contexts/identity/application/authorization/invite-members.policy';
import { ReadMembersPolicy } from '@/contexts/identity/application/authorization/read-members.policy';
import { RemoveMembersPolicy } from '@/contexts/identity/application/authorization/remove-members.policy';
import { RevokeDelegationsPolicy } from '@/contexts/identity/application/authorization/revoke-delegations.policy';
import { RevokeInvitationsPolicy } from '@/contexts/identity/application/authorization/revoke-invitations.policy';
import { FakeAccountRepository } from '@/contexts/identity/test/fakes/account.repository.fake';
import { FakeDelegationRepository } from '@/contexts/identity/test/fakes/delegation.repository.fake';
import { FakeIdentityProviderAdmin } from '@/contexts/identity/test/fakes/identity-provider-admin.fake';
import { FakeInvitationRepository } from '@/contexts/identity/test/fakes/invitation.repository.fake';
import { FakeInvitationTokens } from '@/contexts/identity/test/fakes/invitation-tokens.fake';
import { FakeMemberRepository } from '@/contexts/identity/test/fakes/member.repository.fake';
import { FakeOrganisationRepository } from '@/contexts/identity/test/fakes/organisation.repository.fake';
import { FakeSearchMembersReader } from '@/contexts/identity/test/fakes/search-members-reader.fake';

/** The role every signed-in person holds in these specs: the platform grants it the permissions of the context. */
const PERSON = 'person';

const authorizer = new RoleBasedAuthorizer({ roles: { [PERSON]: Object.values(identityPermissions) } });

/** What each use case of the context requires, as `identity.module.ts` lists it. */
const people = authorizationMiddleware({
  authorizer,
  map: AuthorizationMap.of(
    requires(AcceptInvitationCommand, identityPermissions['invitation.accept'], {
      resource: () => ({ type: 'context', id: 'identity' }),
    }),
    requires(ChangeMemberRoleCommand, identityPermissions['member.change-role'], {
      resource: () => ({ type: 'context', id: 'identity' }),
    }),
    requires(DeactivateAccountCommand, identityPermissions['account.deactivate'], {
      resource: () => ({ type: 'context', id: 'identity' }),
    }),
    requires(DeclineInvitationCommand, identityPermissions['invitation.decline'], {
      resource: () => ({ type: 'context', id: 'identity' }),
    }),
    requires(GrantDelegationCommand, identityPermissions['delegation.grant'], {
      resource: () => ({ type: 'context', id: 'identity' }),
    }),
    requires(InviteMemberCommand, identityPermissions['member.invite'], {
      resource: () => ({ type: 'context', id: 'identity' }),
    }),
    requires(OpenOrganisationCommand, identityPermissions['organisation.open'], {
      resource: () => ({ type: 'context', id: 'identity' }),
    }),
    requires(ProvisionAccountCommand, identityPermissions['account.provision'], {
      resource: () => ({ type: 'context', id: 'identity' }),
    }),
    requires(RemoveMemberCommand, identityPermissions['member.remove'], {
      resource: () => ({ type: 'context', id: 'identity' }),
    }),
    requires(RevokeDelegationCommand, identityPermissions['delegation.revoke'], {
      resource: () => ({ type: 'context', id: 'identity' }),
    }),
    requires(RevokeInvitationCommand, identityPermissions['invitation.revoke'], {
      resource: () => ({ type: 'context', id: 'identity' }),
    }),
    requires(SearchMembersQuery, identityPermissions['member.search'], {
      resource: () => ({ type: 'context', id: 'identity' }),
    }),
  ),
});

/**
 * The context on fakes, wired as `identity.module.ts` wires it, behind an authorizer that
 * grants its permissions to every signed-in person: inside an organisation, its own policies
 * decide. `as(id)` is that person, `stranger` an actor the platform grants nothing.
 */
export function arrangeIdentity() {
  const ports = fakePorts();
  const buses = createTestBuses({ eventBusFailures: 'as-thrown' });
  const wired = { buses, ports, repositories: dispatchedBy(buses, ports), access: accessOn(buses) };

  buses.commandBus.use(people);
  buses.queryBus.use(people);
  registerAccountsAndOrganisations(wired);
  registerInvitations(wired);
  registerMembersAndDelegations(wired);
  publishTheFacts(buses);

  const start = (): Promise<void> => listen(wired);
  const as = (id: string): Actor => anActor().named(id).withRole(PERSON).build();

  return { application: { ...buses, start }, ...ports, as, stranger: anActor().named('stranger').build() };
}

/**
 * The same, started: its consumers listen, among them those that bring the identity provider in
 * line with the facts the context publishes (`application/integration/handlers/`).
 */
export async function startedIdentity(): Promise<ReturnType<typeof arrangeIdentity>> {
  const arranged = arrangeIdentity();

  await arranged.application.start();

  return arranged;
}

function fakePorts() {
  return {
    accounts: new FakeAccountRepository(),
    organisations: new FakeOrganisationRepository(),
    members: new FakeMemberRepository(),
    invitations: new FakeInvitationRepository(),
    delegations: new FakeDelegationRepository(),
    identityProvider: new FakeIdentityProviderAdmin(),
    tokens: new FakeInvitationTokens(),
    reader: new FakeSearchMembersReader(),
  };
}

/** The repositories as the application hands them to the handlers: a save announces the events of the aggregate. */
function dispatchedBy(buses: TestBuses, ports: ReturnType<typeof fakePorts>) {
  return {
    accounts: buses.dispatching(ports.accounts),
    organisations: buses.dispatching(ports.organisations),
    members: buses.dispatching(ports.members),
    invitations: buses.dispatching(ports.invitations),
    delegations: buses.dispatching(ports.delegations),
  };
}

/** The policies of the context, as the platform lists them in `access-policies.ts`. */
function accessOn(buses: TestBuses): Access {
  return new PolicyAccess({
    authorizer,
    clock: buses.clock,
    policies: [
      new ChangeMemberRolesPolicy(),
      new GrantDelegationsPolicy(),
      new InviteMembersPolicy(),
      new ReadMembersPolicy(),
      new RemoveMembersPolicy(),
      new RevokeDelegationsPolicy(),
      new RevokeInvitationsPolicy(),
    ],
  });
}

interface Wired {
  readonly buses: TestBuses;
  readonly ports: ReturnType<typeof fakePorts>;
  readonly repositories: ReturnType<typeof dispatchedBy>;
  readonly access: Access;
}

function registerAccountsAndOrganisations({ buses, repositories }: Wired): void {
  const { commandBus, ids, clock } = buses;
  const { accounts, organisations, members, delegations } = repositories;

  commandBus.register(ProvisionAccountCommand, new ProvisionAccountHandler(accounts, clock));

  commandBus.register(
    DeactivateAccountCommand,
    new DeactivateAccountHandler(accounts, organisations, members, delegations, clock),
  );

  commandBus.register(
    OpenOrganisationCommand,
    new OpenOrganisationHandler(organisations, members, accounts, ids, clock),
  );
}

function registerInvitations({ buses, repositories, ports, access }: Wired): void {
  const { commandBus, ids, clock } = buses;
  const { accounts, members, invitations, delegations } = repositories;

  commandBus.register(
    InviteMemberCommand,
    new InviteMemberHandler(invitations, members, delegations, ports.tokens, access, ids, clock),
  );

  commandBus.register(
    AcceptInvitationCommand,
    new AcceptInvitationHandler(invitations, members, accounts, ports.tokens, ids, clock),
  );

  commandBus.register(
    DeclineInvitationCommand,
    new DeclineInvitationHandler(invitations, accounts, ports.tokens, clock),
  );

  commandBus.register(
    RevokeInvitationCommand,
    new RevokeInvitationHandler(invitations, members, delegations, access, clock),
  );
}

function registerMembersAndDelegations({ buses, repositories, ports, access }: Wired): void {
  const { commandBus, queryBus, ids, clock } = buses;
  const { organisations, members, delegations } = repositories;

  commandBus.register(
    ChangeMemberRoleCommand,
    new ChangeMemberRoleHandler(organisations, members, delegations, access, clock),
  );

  commandBus.register(RemoveMemberCommand, new RemoveMemberHandler(organisations, members, delegations, access, clock));
  commandBus.register(GrantDelegationCommand, new GrantDelegationHandler(delegations, members, access, ids, clock));
  commandBus.register(RevokeDelegationCommand, new RevokeDelegationHandler(delegations, members, access, clock));
  queryBus.register(SearchMembersQuery, new SearchMembersHandler(ports.reader, members, delegations, access, clock));
}

/** The facts the context announces, published as the integration events of its published language. */
function publishTheFacts({ domainEvents, eventBus, ids }: TestBuses): void {
  domainEvents.on(
    AccountDeactivated.eventName,
    announcedBy(AccountDeactivated, new AccountDeactivatedPublisher(eventBus, ids)),
  );

  domainEvents.on(
    OrganisationOpened.eventName,
    announcedBy(OrganisationOpened, new OrganisationOpenedPublisher(eventBus, ids)),
  );

  domainEvents.on(MemberJoined.eventName, announcedBy(MemberJoined, new MemberJoinedPublisher(eventBus, ids)));

  domainEvents.on(
    MemberRoleChanged.eventName,
    announcedBy(MemberRoleChanged, new MemberRoleChangedPublisher(eventBus, ids)),
  );

  domainEvents.on(MemberRemoved.eventName, announcedBy(MemberRemoved, new MemberRemovedPublisher(eventBus, ids)));

  domainEvents.on(
    DelegationGranted.eventName,
    announcedBy(DelegationGranted, new DelegationGrantedPublisher(eventBus, ids)),
  );

  domainEvents.on(
    DelegationRevoked.eventName,
    announcedBy(DelegationRevoked, new DelegationRevokedPublisher(eventBus, ids)),
  );
}

/** A handler of the dispatcher that hands the events of one class to their publisher. */
function announcedBy<Fact>(
  fact: abstract new (...args: never[]) => Fact,
  publisher: { handle(event: Fact): Promise<void> },
) {
  return async (event: unknown): Promise<void> => {
    if (event instanceof fact) {
      await publisher.handle(event);
    }
  };
}

/** The consumers that bring the identity provider in line, each event handled once. */
function listen({ buses, repositories, ports }: Wired): Promise<void> {
  const processed = new InMemoryProcessedEventStore();

  const options = (consumer: string) => ({
    consumer: `identity.${consumer}`,
    processed,
    unitOfWork: buses.unitOfWork,
    scope: buses.executionScope,
  });

  const disables = new AccountDeactivatedIntegrationHandler(ports.identityProvider);
  const joins = new MemberJoinedIntegrationHandler(repositories.members, ports.identityProvider);
  const removes = new MemberRemovedIntegrationHandler(repositories.members, ports.identityProvider);
  const opens = new OrganisationOpenedIntegrationHandler(ports.identityProvider);

  subscribeAll(buses.eventBus, [
    on(accountDeactivatedV1, (event) => disables.handle(event), options('provider-disables-account')),
    on(memberJoinedV1, (event) => joins.handle(event), options('provider-follows-joined-member')),
    on(memberRemovedV1, (event) => removes.handle(event), options('provider-follows-removed-member')),
    on(organisationOpenedV1, (event) => opens.handle(event), options('provider-opens-organisation')),
  ]);

  return Promise.resolve();
}
