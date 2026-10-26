import { isAuthenticated, type Actor } from '@ddd-ts-kit/kernel';
import { OrganisationRights } from '@/contexts/identity/domain/value-objects/organisation-rights.vo';
import { MemberRight } from '@/contexts/identity/domain/vocabularies/member-right.vocabulary';
import { identityPermissions } from '@/contexts/identity/identity.permissions';

/** An account changes the roles of an organisation where it manages the members. */
export class ChangeMemberRolesPolicy {
  readonly name = 'identity.change-member-roles';

  readonly permission = identityPermissions['member.change-role'];

  appliesTo(subject: unknown): subject is OrganisationRights {
    return subject instanceof OrganisationRights;
  }

  allows(actor: Actor, rights: OrganisationRights): boolean {
    return isAuthenticated(actor) && rights.accountId === actor.id && rights.includes(MemberRight.ManageMembers);
  }
}
