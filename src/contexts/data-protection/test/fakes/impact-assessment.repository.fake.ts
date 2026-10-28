import { InMemoryRepository, snapshots } from '@ddd-ts-kit/testing';
import { ImpactAssessment } from '@/contexts/data-protection/domain/aggregates/impact-assessment.aggregate';
import type { ImpactAssessmentRepository } from '@/contexts/data-protection/domain/repositories/impact-assessment.repository';

export class FakeImpactAssessmentRepository
  extends InMemoryRepository<ImpactAssessment>
  implements ImpactAssessmentRepository
{
  constructor() {
    super(
      snapshots({
        toSnapshot: (stored: ImpactAssessment) => ({ id: stored.id, state: stored.toState() }),
        fromSnapshot: ({ id, state }) => ImpactAssessment.rehydrate(id, state),
      }),
    );
  }

  // TODO(domain): implement each lookup of ImpactAssessmentRepository over `this.all()`, so that handlers are tested against a working repository.
}
