import { InMemoryRepository, snapshots } from '@ddd-ts-kit/testing';
import { Branch } from '@/contexts/branch-network/domain/aggregates/branch.aggregate';
import type { BranchRepository } from '@/contexts/branch-network/domain/repositories/branch.repository';

export class FakeBranchRepository extends InMemoryRepository<Branch> implements BranchRepository {
  constructor() {
    super(
      snapshots({
        toSnapshot: (stored: Branch) => ({ id: stored.id, state: stored.toState() }),
        fromSnapshot: ({ id, state }) => Branch.rehydrate(id, state),
      }),
    );
  }
}
