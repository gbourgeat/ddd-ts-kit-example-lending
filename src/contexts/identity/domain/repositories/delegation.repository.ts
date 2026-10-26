import { Repository } from '@ddd-ts-kit/kernel';
import type { Delegation } from '@/contexts/identity/domain/aggregates/delegation.aggregate';

export abstract class DelegationRepository extends Repository<Delegation> {
  /** The delegations not ended yet that lend rights to this member of the organisation, started or not. */
  abstract findUnendedTo(organisationId: string, delegateId: string): Promise<readonly Delegation[]>;

  /** The delegations not ended yet that this member of the organisation gave or received. */
  abstract findUnendedInvolving(organisationId: string, accountId: string): Promise<readonly Delegation[]>;
}
