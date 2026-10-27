import { InMemoryRepository, snapshots } from '@ddd-ts-kit/testing';
import { ConflictOfInterest } from '@/contexts/branch-network/domain/aggregates/conflict-of-interest.aggregate';
import type { ConflictOfInterestRepository } from '@/contexts/branch-network/domain/repositories/conflict-of-interest.repository';

export class FakeConflictOfInterestRepository
  extends InMemoryRepository<ConflictOfInterest>
  implements ConflictOfInterestRepository
{
  constructor() {
    super(
      snapshots({
        toSnapshot: (stored: ConflictOfInterest) => ({ id: stored.id, state: stored.toState() }),
        fromSnapshot: ({ id, state }) => ConflictOfInterest.rehydrate(id, state),
      }),
    );
  }
}
