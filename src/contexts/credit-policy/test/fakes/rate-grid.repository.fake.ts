import { InMemoryRepository, snapshots } from '@ddd-ts-kit/testing';
import { RateGrid } from '@/contexts/credit-policy/domain/aggregates/rate-grid.aggregate';
import type { RateGridRepository } from '@/contexts/credit-policy/domain/repositories/rate-grid.repository';

export class FakeRateGridRepository extends InMemoryRepository<RateGrid> implements RateGridRepository {
  constructor() {
    super(
      snapshots({
        toSnapshot: (stored: RateGrid) => ({ id: stored.id, state: stored.toState() }),
        fromSnapshot: ({ id, state }) => RateGrid.rehydrate(id, state),
      }),
    );
  }
}
