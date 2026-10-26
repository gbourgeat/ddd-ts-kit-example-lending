import { isAuthenticated, type Actor } from '@ddd-ts-kit/kernel';
import { OrganisationRights } from '@/contexts/identity/domain/value-objects/organisation-rights.vo';
import { MemberRight } from '@/contexts/identity/domain/vocabularies/member-right.vocabulary';
import { identityPermissions } from '@/contexts/identity/identity.permissions';

/** An account searches the members of an organisation it belongs to. */
export class ReadMembersPolicy {
  readonly name = 'identity.read-members';

  readonly permission = identityPermissions['member.search'];

  appliesTo(subject: unknown): subject is OrganisationRights {
    return subject instanceof OrganisationRights;
  }

  allows(actor: Actor, rights: OrganisationRights): boolean {
    return isAuthenticated(actor) && rights.accountId === actor.id && rights.includes(MemberRight.ReadMembers);
  }
}
