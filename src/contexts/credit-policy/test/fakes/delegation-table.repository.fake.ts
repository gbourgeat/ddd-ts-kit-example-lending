import { InMemoryRepository, snapshots } from '@ddd-ts-kit/testing';
import { DelegationTable } from '@/contexts/credit-policy/domain/aggregates/delegation-table.aggregate';
import type { DelegationTableRepository } from '@/contexts/credit-policy/domain/repositories/delegation-table.repository';

export class FakeDelegationTableRepository
  extends InMemoryRepository<DelegationTable>
  implements DelegationTableRepository
{
  constructor() {
    super(
      snapshots({
        toSnapshot: (stored: DelegationTable) => ({ id: stored.id, state: stored.toState() }),
        fromSnapshot: ({ id, state }) => DelegationTable.rehydrate(id, state),
      }),
    );
  }
}
