import { InMemoryRepository, snapshots } from '@ddd-ts-kit/testing';
import { ScoringModel } from '@/contexts/credit-scoring/domain/aggregates/scoring-model.aggregate';
import { ScoringModelVersion } from '@/contexts/credit-scoring/domain/entities/scoring-model-version.entity';
import type { ScoringModelRepository } from '@/contexts/credit-scoring/domain/repositories/scoring-model.repository';

export class FakeScoringModelRepository extends InMemoryRepository<ScoringModel> implements ScoringModelRepository {
  constructor() {
    super(
      snapshots({
        toSnapshot: (stored: ScoringModel) => ({
          id: stored.id,
          state: {
            registeredAt: stored.registeredAt,
            versions: stored.versions.map((version) => ({ id: version.id, state: version.toState() })),
          },
        }),
        fromSnapshot: ({ id, state }) =>
          ScoringModel.rehydrate(id, {
            registeredAt: state.registeredAt,
            versions: state.versions.map((version) => ScoringModelVersion.rehydrate(version.id, version.state)),
          }),
      }),
    );
  }
}
