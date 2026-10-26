import type { Policy } from '@ddd-ts-kit/auth';
// ddd-ts-kit:imports
import { ChangeMemberRolesPolicy } from '@/contexts/identity/application/authorization/change-member-roles.policy';
import { GrantDelegationsPolicy } from '@/contexts/identity/application/authorization/grant-delegations.policy';
import { InviteMembersPolicy } from '@/contexts/identity/application/authorization/invite-members.policy';
import { ReadMembersPolicy } from '@/contexts/identity/application/authorization/read-members.policy';
import { RemoveMembersPolicy } from '@/contexts/identity/application/authorization/remove-members.policy';
import { RevokeDelegationsPolicy } from '@/contexts/identity/application/authorization/revoke-delegations.policy';
import { RevokeInvitationsPolicy } from '@/contexts/identity/application/authorization/revoke-invitations.policy';
// /ddd-ts-kit:imports

/** The rules about one element that `Access.authorize` asks before the authorizer, from every context. */
export const accessPolicies: readonly Policy<unknown>[] = [
  // ddd-ts-kit:policies
  new ChangeMemberRolesPolicy(),
  new GrantDelegationsPolicy(),
  new InviteMembersPolicy(),
  new ReadMembersPolicy(),
  new RemoveMembersPolicy(),
  new RevokeDelegationsPolicy(),
  new RevokeInvitationsPolicy(),
  // /ddd-ts-kit:policies
];
