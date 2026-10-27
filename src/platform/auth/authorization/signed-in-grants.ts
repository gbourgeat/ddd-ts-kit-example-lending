import type { Grant } from '@ddd-ts-kit/auth';
import { identityPermissions } from '@/contexts/identity/identity.permissions';

/**
 * What every signed-in person may do, whatever the access model of the platform decides for the
 * rest: the permissions of a context that serves each person for themselves, such as their
 * account and the organisations they belong to, whose own policies decide on the element.
 * `createAuthorizer` grants them before it asks the model.
 *
 * Every identity permission but `organisation.open`: opening a bank is reserved to the operator
 * (plan.md, Decisions).
 */
export const signedInGrants: readonly Grant[] = [
  // ddd-ts-kit:signed-in-grants
  identityPermissions['account.provision'].id,
  identityPermissions['account.deactivate'].id,
  identityPermissions['member.invite'].id,
  identityPermissions['invitation.accept'].id,
  identityPermissions['invitation.decline'].id,
  identityPermissions['invitation.revoke'].id,
  identityPermissions['member.change-role'].id,
  identityPermissions['member.remove'].id,
  identityPermissions['member.search'].id,
  identityPermissions['delegation.grant'].id,
  identityPermissions['delegation.revoke'].id,
  // /ddd-ts-kit:signed-in-grants
];
