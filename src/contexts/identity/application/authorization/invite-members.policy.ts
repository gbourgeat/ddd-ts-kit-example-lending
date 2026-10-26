import { isAuthenticated, type Actor } from '@ddd-ts-kit/kernel';
import { OrganisationRights } from '@/contexts/identity/domain/value-objects/organisation-rights.vo';
import { MemberRight } from '@/contexts/identity/domain/vocabularies/member-right.vocabulary';
import { identityPermissions } from '@/contexts/identity/identity.permissions';

/** An account invites to an organisation when its role, or a delegation, lets it invite there. */
export class InviteMembersPolicy {
  readonly name = 'identity.invite-members';

  readonly permission = identityPermissions['member.invite'];

  appliesTo(subject: unknown): subject is OrganisationRights {
    return subject instanceof OrganisationRights;
  }

  allows(actor: Actor, rights: OrganisationRights): boolean {
    return isAuthenticated(actor) && rights.accountId === actor.id && rights.includes(MemberRight.InviteMembers);
  }
}
