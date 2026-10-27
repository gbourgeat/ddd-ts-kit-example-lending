import { InMemoryRepository, snapshots } from '@ddd-ts-kit/testing';
import { Portfolio } from '@/contexts/branch-network/domain/aggregates/portfolio.aggregate';
import type { PortfolioRepository } from '@/contexts/branch-network/domain/repositories/portfolio.repository';

export class FakePortfolioRepository extends InMemoryRepository<Portfolio> implements PortfolioRepository {
  constructor() {
    super(
      snapshots({
        toSnapshot: (stored: Portfolio) => ({ id: stored.id, state: stored.toState() }),
        fromSnapshot: ({ id, state }) => Portfolio.rehydrate(id, state),
      }),
    );
  }
}
