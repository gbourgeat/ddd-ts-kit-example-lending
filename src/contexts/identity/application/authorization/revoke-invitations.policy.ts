import { isAuthenticated, type Actor } from '@ddd-ts-kit/kernel';
import { OrganisationRights } from '@/contexts/identity/domain/value-objects/organisation-rights.vo';
import { MemberRight } from '@/contexts/identity/domain/vocabularies/member-right.vocabulary';
import { identityPermissions } from '@/contexts/identity/identity.permissions';

/** An account takes back the invitations of an organisation where it may invite. */
export class RevokeInvitationsPolicy {
  readonly name = 'identity.revoke-invitations';

  readonly permission = identityPermissions['invitation.revoke'];

  appliesTo(subject: unknown): subject is OrganisationRights {
    return subject instanceof OrganisationRights;
  }

  allows(actor: Actor, rights: OrganisationRights): boolean {
    return isAuthenticated(actor) && rights.accountId === actor.id && rights.includes(MemberRight.InviteMembers);
  }
}
