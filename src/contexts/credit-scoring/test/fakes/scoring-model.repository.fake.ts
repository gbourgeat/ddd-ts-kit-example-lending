import { InMemoryRepository, snapshots } from '@ddd-ts-kit/testing';
import { ScoringModel } from '@/contexts/credit-scoring/domain/aggregates/scoring-model.aggregate';
import type { ScoringModelRepository } from '@/contexts/credit-scoring/domain/repositories/scoring-model.repository';

export class FakeScoringModelRepository extends InMemoryRepository<ScoringModel> implements ScoringModelRepository {
  constructor() {
    super(
      snapshots({
        toSnapshot: (stored: ScoringModel) => ({ id: stored.id, state: stored.toState() }),
        fromSnapshot: ({ id, state }) => ScoringModel.rehydrate(id, state),
      }),
    );
  }

  // TODO(domain): implement each lookup of ScoringModelRepository over `this.all()`, so that handlers are tested against a working repository.
}
