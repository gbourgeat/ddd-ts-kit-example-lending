# Identity

## Purpose

Who the people of the application are, the organisations they belong to and in which role. The identity provider authenticates them; this context keeps their accounts, invites them, and decides what each member may do in an organisation.

## Classification

generic

Every application that serves people who sign in and work in groups needs it, and nothing in it distinguishes this business: it is designed once and kept small.

## Ubiquitous language

| Term | Meaning | Not to be confused with |
|---|---|---|
| Account | A person as the application knows them, under the subject the identity provider gives them; provisioned at their first sign-in, never holding a password |  |
| Subject | The stable identifier the identity provider gives a person: the id of their account |  |
| Provision | Create the account of a person at their first sign-in, from what their token says, and refresh it after |  |
| Deactivate | Stop an account from acting: its person signs in no more, its history stays |  |
| Organisation | A group of accounts that work together, identified by its slug; the tenant of its data when the project has tenants |  |
| Slug | The identifier of an organisation, chosen when it opens: lower-case letters, digits and hyphens |  |
| Member | The membership of one account in one organisation, in one role |  |
| Role | Owner, admin or member: what a member may do in an organisation follows from it |  |
| Right | One thing a member may do in an organisation: read, invite or manage members, grant delegations |  |
| Invitation | An organisation asks a person, by email address, to join in a role; answered with its token within a week, or taken back |  |
| Delegation | A member lends some of the rights of their role to another member, for at most ninety days |  |
| Display name | How a person is shown to the others: from their token, or as they wrote it |  |
| Email address | Where a person is reached, always the one their token says: an invitation is matched on it |  |
| Open | Create an organisation under its slug; the account that opens it is its first owner |  |
| Join | Become a member of an organisation: by opening it, or by accepting an invitation |  |
| Change | Give a member another role; only an owner appoints or changes an owner |  |
| Remove | End a membership; an organisation keeps one owner at least |  |
| Invite | Issue an invitation to an email address, in a role |  |
| Issue | Create an invitation and its token, which is sent once and never stored |  |
| Accept | Answer yes to an invitation sent to oneself, before it expires: one joins in its role |  |
| Decline | Answer no to an invitation sent to oneself |  |
| Grant | Lend rights of a role to another member, for a period |  |
| Revoke | Take back an invitation not answered, or end a delegation before its period |  |
| Period | When a delegation holds: from its start, included, to its end, excluded |  |
| Search | Read a page of the members of an organisation, for one of its members |  |
| Identity provider | The system that authenticates the people (Keycloak): the application follows it, never stores its secrets |  |
| Owner | The highest role: an owner may do everything in an organisation, appointing or changing another owner included |  |
| Last owner | The only owner an organisation has left: they are neither removed nor given another role, an organisation keeps one owner at least |  |
| Above | Higher in the order of roles: an owner is above an admin, an admin above a member |  |
| Own role | The role of the member who acts: they do not change it themselves, and act on no one above it |  |
| Oneself | The member who acts, as the other party of their own act: no one delegates to oneself |  |
| Pending | Said of an invitation issued and not yet accepted, declined, revoked or expired: the only state in which it is answered |  |
| Expire | For an invitation, to pass its week unanswered: it is accepted or declined no more |  |
| Verified | Said of an email address the identity provider confirmed belongs to the person: an account is provisioned with it only then |  |
| Taken | Said of a slug an organisation holds already: two organisations never share one |  |
| Active | Said of a delegation granted and not ended yet: neither revoked nor past its period |  |
| Inverted | Said of a period whose end does not come after its start |  |
| Long | Said of a delegation whose period lasts more than ninety days: a longer one is a role, not a delegation |  |

## Design

Written by the identity preset of ddd-ts-kit (`--preset identity`); from now on it is the code of
this project, to change like any other.

**The identity provider authenticates, this context authorizes.** An account is a person under
the subject their provider gives them (`actor.id`): it is provisioned at their first sign-in from
what their token says (`PUT /accounts/me`) and refreshed at each later one. No password, no secret
of the provider is stored here. The email address of an account is always the one of the token,
never one a client sends, and one the provider verified (`email_verified`): an invitation is
matched on it. A deactivated account leaves every organisation and ends every delegation in the
same unit of work, so that it holds no right anywhere while its last token lives; the last owner
of an organisation appoints another owner before deactivating.

**Organisations, members and roles.** An organisation is opened under its slug, which is its
identity for good, and its opener is its first owner. A member holds one role, `owner`, `admin`
or `member`; what a role grants is one table, `RoleRightsService`. Nobody changes their own role,
and nobody appoints, invites, changes or removes anyone above their own role (only an owner makes
an owner), whatever a delegation lends them. An organisation keeps one owner at least: every
change of a member saves the organisation with it, so that its version orders the changes of its
owners and two owners who remove each other at once cannot both commit.

**Invitations.** An invitation is issued to an email address, in a role, for a week. Its token
is answered to the inviter once (`POST /organisations/:organisationId/invitations`) and only its
SHA-256 digest is stored: send it to the person (a notification context, a link), who accepts or
declines it signed in, with the address it was sent to.

**Delegations.** A member lends some of the rights of their role to another member of the
organisation, for ninety days at most: the delegate acts in their own name, with those rights, and
the audit trail of the project records every use case either way; the facts a change leads to
name the delegation it was decided under (`delegationId`). A delegation lends nothing beyond the
role of its delegator, never what was lent to them, never the power to act above the delegate's
own role, and it ends when one of its two members leaves or when its delegator changes role.

**Who may do what.** Every use case requires a permission of `identityPermissions`, which
the platform grants to every signed-in person whatever its access model (roles, attribute
policies, relationships, OpenFGA or an adapter of the project): the grant `'identity:*'`
of `signed-in-grants.ts`, which `createAuthorizer` answers before it asks the model
(`SignedInGrantsAuthorizer` of `@ddd-ts-kit/auth`). Systems, services and anonymous callers get
nothing from it.

Inside an organisation, the policies of `application/authorization/` decide on the rights the
actor holds there (`OrganisationRights`): their role, and the rights an active delegation lends
them. The integration events (`member.joined`, `member.role-changed`, `member.removed`,
`delegation.granted`, `delegation.revoked`) let another context write the relationships of its
own model, or the tuples of OpenFGA, from these facts.

**Tenants.** Each organisation is a tenant: its slug is the tenant id, the integration events of
an organisation carry it as their tenant, and the consumers of the other contexts run in it. The
tables of this context belong to no tenant, since it decides who belongs to which (ADR-0001).
The token names the organisations of the person: with Keycloak, the `organization` claim, which
`createAuthenticator` reads (`tenantClaim: 'organization'`). One organisation is the tenant of
every request; several are the `tenants` of the actor, and a request names the one it works in
(`x-tenant-id`), refused if the person is not a member of it.

**The identity provider follows, at least once.** The consumers of `application/integration/handlers/`
read the facts the context publishes through its outbox and tell the provider
(`IdentityProviderAdmin`): it knows the organisation under its slug, adds or removes its members,
and disables a deactivated account. A provider that is down is asked again by whoever delivers the
fact (the outbox relay, the broker) until it answers, so a removal or a deactivation is never
lost; each consumer brings the provider in line with what the context holds now, so that a late
retry never gives a removed person their organisation back. `KeycloakIdentityProviderAdmin` is a
recipe for the administration API of Keycloak 26 or later (organizations enabled in the realm), as
a confidential client holding `manage-users` and `manage-realm` of `realm-management`; it reads
`KEYCLOAK_URL`, `KEYCLOAK_REALM`, `IDENTITY_PROVIDER_ADMIN_CLIENT_ID` and
`IDENTITY_PROVIDER_ADMIN_CLIENT_SECRET` when a call is made. Its spec runs it against a local
server that answers as Keycloak does: run it once against your realm before relying on it. Another
provider is another adapter of the same port.
## Aggregates

<!-- ddd-ts-kit:aggregates -->
- `Account`
- `Delegation`
- `Invitation`
- `Member`
- `Organisation`
<!-- /ddd-ts-kit:aggregates -->

## Published events

<!-- ddd-ts-kit:events -->
- `identity.account.deactivated` (version 1)
- `identity.delegation.granted` (version 1)
- `identity.delegation.revoked` (version 1)
- `identity.member.joined` (version 1)
- `identity.member.removed` (version 1)
- `identity.member.role-changed` (version 1)
- `identity.organisation.opened` (version 1)
<!-- /ddd-ts-kit:events -->

## Personal data

<!-- ddd-ts-kit:personal-data -->
| Table | About | Personal data | On erasure | Kept |
|---|---|---|---|---|
| `accounts` | `id` | `email`, `display_name` | pseudonymised | until erased |
| `invitations` | `id` | `email` | row deleted | until erased |
<!-- /ddd-ts-kit:personal-data -->

## Permissions

<!-- ddd-ts-kit:permissions -->
- `identity:account.provision`
- `identity:account.deactivate`
- `identity:organisation.open`
- `identity:member.invite`
- `identity:invitation.accept`
- `identity:invitation.decline`
- `identity:invitation.revoke`
- `identity:member.change-role`
- `identity:member.remove`
- `identity:member.search`
- `identity:delegation.grant`
- `identity:delegation.revoke`
<!-- /ddd-ts-kit:permissions -->

## Scheduled jobs

<!-- ddd-ts-kit:jobs -->
No scheduled job.
<!-- /ddd-ts-kit:jobs -->

## Background jobs

<!-- ddd-ts-kit:background-jobs -->
No background job.
<!-- /ddd-ts-kit:background-jobs -->

## State machines

<!-- ddd-ts-kit:state-machines -->
No state machine.
<!-- /ddd-ts-kit:state-machines -->

## Process managers

<!-- ddd-ts-kit:processes -->
No process manager.
<!-- /ddd-ts-kit:processes -->

## Relationships

<!-- ddd-ts-kit:relationships -->
- Upstream of `data-protection` (conformist).
- Upstream of `brokerage` (conformist).
- Upstream of `customer-due-diligence` (conformist).
- Upstream of `branch-network` (conformist).
- Upstream of `credit-application` (conformist).
- Upstream of `servicing` (conformist).
- Upstream of `financial-crime` (conformist).
- Upstream of `reporting` (conformist).
<!-- /ddd-ts-kit:relationships -->

## Reference

<!-- ddd-ts-kit:reference -->
Generated from the code by `ddd-ts-kit docs`; the same facts as data: `ddd-ts-kit describe identity --json`. The fields of each schema are in the generated contracts: [OpenAPI](../../../openapi/openapi.yaml), [event catalog](../../../docs/integration/event-catalog.md).

**Dependencies**: upstreams: none; downstreams: `data-protection` (conformist), `brokerage` (conformist), `customer-due-diligence` (conformist), `branch-network` (conformist), `credit-application` (conformist), `servicing` (conformist), `financial-crime` (conformist), `reporting` (conformist).

### Use cases

| Use case | Kind | Permission |
|---|---|---|
| `AcceptInvitation` | command | `invitation.accept` |
| `ChangeMemberRole` | command | `member.change-role` |
| `DeactivateAccount` | command | `account.deactivate` |
| `DeclineInvitation` | command | `invitation.decline` |
| `GrantDelegation` | command | `delegation.grant` |
| `InviteMember` | command | `member.invite` |
| `OpenOrganisation` | command | `organisation.open` |
| `ProvisionAccount` | command | `account.provision` |
| `RemoveMember` | command | `member.remove` |
| `RevokeDelegation` | command | `delegation.revoke` |
| `RevokeInvitation` | command | `invitation.revoke` |
| `SearchMembers` | query | `member.search` |

### Routes

| Method | Path | Operation | Group | Guards | Use case | Permission | Request | Responses | Errors |
|---|---|---|---|---|---|---|---|---|---|
| PUT | `/accounts/me` | `provisionAccount` | `AccountsRoutes` | `Authenticated` | `ProvisionAccount` | `account.provision` | body: `ProvisionAccountBody` | 200: `acceptedSchema` | `UNAUTHORIZED`, `FORBIDDEN`, `EMAIL_NOT_VERIFIED`, `INVALID_EMAIL_ADDRESS`, `INVALID_DISPLAY_NAME`, `ACCOUNT_DEACTIVATED` |
| POST | `/accounts/me/deactivation` | `deactivateAccount` | `AccountsRoutes` | `Authenticated` | `DeactivateAccount` | `account.deactivate` |  | 200: `acceptedSchema` | `UNAUTHORIZED`, `FORBIDDEN`, `ACCOUNT_NOT_FOUND`, `ACCOUNT_ALREADY_DEACTIVATED`, `ORGANISATION_NOT_FOUND`, `LAST_OWNER` |
| POST | `/invitations/acceptance` | `acceptInvitation` | `InvitationsRoutes` | `Authenticated` | `AcceptInvitation` | `invitation.accept` | body: `InvitationToken` | 200: `acceptedSchema` | `UNAUTHORIZED`, `FORBIDDEN`, `INVITATION_NOT_FOUND`, `ACCOUNT_NOT_FOUND`, `ACCOUNT_DEACTIVATED`, `INVITATION_NOT_PENDING`, `INVITATION_EXPIRED`, `INVITATION_ADDRESSED_TO_ANOTHER`, `ALREADY_MEMBER` |
| POST | `/invitations/declination` | `declineInvitation` | `InvitationsRoutes` | `Authenticated` | `DeclineInvitation` | `invitation.decline` | body: `InvitationToken` | 200: `acceptedSchema` | `UNAUTHORIZED`, `FORBIDDEN`, `INVITATION_NOT_FOUND`, `ACCOUNT_NOT_FOUND`, `INVITATION_NOT_PENDING`, `INVITATION_EXPIRED`, `INVITATION_ADDRESSED_TO_ANOTHER` |
| POST | `/organisations` | `openOrganisation` | `OrganisationsRoutes` | `Authenticated` | `OpenOrganisation` | `organisation.open` | body: `OpenOrganisationBody` | 201: `acceptedSchema` | `UNAUTHORIZED`, `FORBIDDEN`, `ACCOUNT_NOT_FOUND`, `ACCOUNT_DEACTIVATED`, `ORGANISATION_SLUG_TAKEN`, `INVALID_ORGANISATION_SLUG`, `INVALID_ORGANISATION_NAME` |
| POST | `/organisations/:organisationId/delegations` | `grantDelegation` | `OrganisationsRoutes` | `Authenticated` | `GrantDelegation` | `delegation.grant` | params: `GrantDelegationParams`, body: `GrantDelegationBody` | 201: `acceptedSchema` | `UNAUTHORIZED`, `FORBIDDEN`, `MEMBER_NOT_FOUND`, `DELEGATION_TO_ONESELF`, `DELEGATION_WITHOUT_RIGHTS`, `DELEGATION_BEYOND_RIGHTS`, `DELEGATION_PERIOD_INVERTED`, `DELEGATION_TOO_LONG` |
| DELETE | `/organisations/:organisationId/delegations/:delegationId` | `revokeDelegation` | `OrganisationsRoutes` | `Authenticated` | `RevokeDelegation` | `delegation.revoke` | params: `RevokeDelegationParams` | 200: `acceptedSchema` | `UNAUTHORIZED`, `FORBIDDEN`, `DELEGATION_NOT_FOUND`, `DELEGATION_NOT_ACTIVE` |
| POST | `/organisations/:organisationId/invitations` | `inviteMember` | `OrganisationsRoutes` | `Authenticated` | `InviteMember` | `member.invite` | params: `InviteMemberParams`, body: `InviteMemberBody` | 201: `InviteMemberAccepted` | `UNAUTHORIZED`, `FORBIDDEN`, `INVALID_EMAIL_ADDRESS`, `ABOVE_OWN_ROLE`, `OWNERS_ONLY` |
| DELETE | `/organisations/:organisationId/invitations/:invitationId` | `revokeInvitation` | `OrganisationsRoutes` | `Authenticated` | `RevokeInvitation` | `invitation.revoke` | params: `RevokeInvitationParams` | 200: `acceptedSchema` | `UNAUTHORIZED`, `FORBIDDEN`, `INVITATION_NOT_FOUND`, `INVITATION_NOT_PENDING` |
| GET | `/organisations/:organisationId/members` | `searchMembers` | `OrganisationsRoutes` | `Authenticated` | `SearchMembers` | `member.search` | params: `SearchMembersParams`, query | 200: `page of SearchMembersLine` | `UNAUTHORIZED`, `FORBIDDEN` |
| DELETE | `/organisations/:organisationId/members/:accountId` | `removeMember` | `OrganisationsRoutes` | `Authenticated` | `RemoveMember` | `member.remove` | params: `RemoveMemberParams` | 200: `acceptedSchema` | `UNAUTHORIZED`, `FORBIDDEN`, `ORGANISATION_NOT_FOUND`, `MEMBER_NOT_FOUND`, `ABOVE_OWN_ROLE`, `OWNERS_ONLY`, `LAST_OWNER` |
| PUT | `/organisations/:organisationId/members/:accountId/role` | `changeMemberRole` | `OrganisationsRoutes` | `Authenticated` | `ChangeMemberRole` | `member.change-role` | params: `ChangeMemberRoleParams`, body: `ChangeMemberRoleBody` | 200: `acceptedSchema` | `UNAUTHORIZED`, `FORBIDDEN`, `ORGANISATION_NOT_FOUND`, `MEMBER_NOT_FOUND`, `OWN_ROLE`, `ABOVE_OWN_ROLE`, `OWNERS_ONLY`, `LAST_OWNER` |

### Consumed events

| Event | Version | From | Handler | Consumer |
|---|---|---|---|---|
| `identity.account.deactivated` | 1 | `identity` | `AccountDeactivatedIntegrationHandler` | `identity.provider-disables-account` |
| `identity.account.deactivated` | 1 | `identity` | `MemberJoinedIntegrationHandler` | `identity.provider-disables-account` |
| `identity.account.deactivated` | 1 | `identity` | `MemberRemovedIntegrationHandler` | `identity.provider-disables-account` |
| `identity.account.deactivated` | 1 | `identity` | `OrganisationOpenedIntegrationHandler` | `identity.provider-disables-account` |

### Publishers

| Event | Versions | Publisher |
|---|---|---|
| `identity.account.deactivated` | 1 | `AccountDeactivatedPublisher` |
| `identity.delegation.granted` | 1 | `DelegationGrantedPublisher` |
| `identity.delegation.revoked` | 1 | `DelegationRevokedPublisher` |
| `identity.member.joined` | 1 | `MemberJoinedPublisher` |
| `identity.member.removed` | 1 | `MemberRemovedPublisher` |
| `identity.member.role-changed` | 1 | `MemberRoleChangedPublisher` |
| `identity.organisation.opened` | 1 | `OrganisationOpenedPublisher` |

### Ports

| Port | Kind | Adapters |
|---|---|---|
| `AccountRepository` | external | `PrismaAccountRepository` |
| `DelegationRepository` | external | `PrismaDelegationRepository` |
| `IdentityPersonalDataErasure` | external | `PrismaIdentityPersonalDataErasure` |
| `IdentityPersonalDataExport` | external | `PrismaIdentityPersonalDataExport` |
| `IdentityProviderAdmin` | external | `KeycloakIdentityProviderAdmin` |
| `IdentityProviderConnection` | external | `EnvironmentIdentityProviderConnection` |
| `InvitationRepository` | external | `PrismaInvitationRepository` |
| `InvitationTokens` | external | `CryptoInvitationTokens` |
| `MemberRepository` | external | `PrismaMemberRepository` |
| `OrganisationRepository` | external | `PrismaOrganisationRepository` |
| `SearchMembersReader` | external | `PrismaSearchMembersReader` |

### Policies

| Policy | Permission |
|---|---|
| `ChangeMemberRoles` | `member.change-role` |
| `GrantDelegations` | `delegation.grant` |
| `InviteMembers` | `member.invite` |
| `ReadMembers` | `member.search` |
| `RemoveMembers` | `member.remove` |
| `RevokeDelegations` | `delegation.revoke` |
| `RevokeInvitations` | `invitation.revoke` |

### Errors

| Refusal | Factory | Code | Exposed facts |
|---|---|---|---|
| `AboveOwnRole` | `forOrganisation` | `ABOVE_OWN_ROLE` | none |
| `AccountAlreadyDeactivated` | `forAccount` | `ACCOUNT_ALREADY_DEACTIVATED` | none |
| `AlreadyMember` | `forMembership` | `ALREADY_MEMBER` | `organisationId`, `accountId` |
| `DeactivatedAccount` | `forAccount` | `ACCOUNT_DEACTIVATED` | none |
| `DelegationNotActive` | `forDelegation` | `DELEGATION_NOT_ACTIVE` | none |
| `DelegationPeriodInverted` | `forPeriod` | `DELEGATION_PERIOD_INVERTED` | `startsAt`, `endsAt` |
| `DelegationToOneself` | `forAccount` | `DELEGATION_TO_ONESELF` | none |
| `DelegationTooLong` | `withLongestDays` | `DELEGATION_TOO_LONG` | `longestDays` |
| `DelegationWithNoRight` | `withNoRight` | `DELEGATION_WITHOUT_RIGHTS` | none |
| `EmailNotVerified` | `forAccount` | `EMAIL_NOT_VERIFIED` | none |
| `InvalidDisplayName` | `forValue` | `INVALID_DISPLAY_NAME` | none |
| `InvalidEmailAddress` | `forValue` | `INVALID_EMAIL_ADDRESS` | none |
| `InvalidOrganisationName` | `forValue` | `INVALID_ORGANISATION_NAME` | none |
| `InvalidOrganisationSlug` | `forValue` | `INVALID_ORGANISATION_SLUG` | none |
| `InvitationExpired` | `forInvitation` | `INVITATION_EXPIRED` | `expiresAt` |
| `InvitationNotAddressedToAccount` | `forInvitation` | `INVITATION_ADDRESSED_TO_ANOTHER` | none |
| `InvitationNotPending` | `forInvitation` | `INVITATION_NOT_PENDING` | `status` |
| `LastOwner` | `forOrganisation` | `LAST_OWNER` | `organisationId` |
| `NotAnOwner` | `forOrganisation` | `OWNERS_ONLY` | none |
| `OrganisationSlugTaken` | `forSlug` | `ORGANISATION_SLUG_TAKEN` | `slug` |
| `OwnRole` | `forOrganisation` | `OWN_ROLE` | none |
| `RightNotInRole` | `forRight` | `DELEGATION_BEYOND_RIGHTS` | `right` |
| `UnknownAccount` | `forAccount` | `ACCOUNT_NOT_FOUND` | `accountId` |
| `UnknownDelegation` | `forDelegation` | `DELEGATION_NOT_FOUND` | `delegationId` |
| `UnknownInvitation` | `forReference` | `INVITATION_NOT_FOUND` | none |
| `UnknownMember` | `forMembership` | `MEMBER_NOT_FOUND` | `organisationId`, `accountId` |
| `UnknownOrganisation` | `forOrganisation` | `ORGANISATION_NOT_FOUND` | `organisationId` |
<!-- /ddd-ts-kit:reference -->
