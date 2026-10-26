import { isAuthenticated, type Actor } from '@ddd-ts-kit/kernel';
import { OrganisationRights } from '@/contexts/identity/domain/value-objects/organisation-rights.vo';
import { MemberRight } from '@/contexts/identity/domain/vocabularies/member-right.vocabulary';
import { identityPermissions } from '@/contexts/identity/identity.permissions';

/** An account revokes the delegations of an organisation where its role lets it delegate. */
export class RevokeDelegationsPolicy {
  readonly name = 'identity.revoke-delegations';

  readonly permission = identityPermissions['delegation.revoke'];

  appliesTo(subject: unknown): subject is OrganisationRights {
    return subject instanceof OrganisationRights;
  }

  allows(actor: Actor, rights: OrganisationRights): boolean {
    return isAuthenticated(actor) && rights.accountId === actor.id && rights.includes(MemberRight.GrantDelegations);
  }
}
