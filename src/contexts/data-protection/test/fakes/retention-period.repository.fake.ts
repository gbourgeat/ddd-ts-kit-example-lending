import { InMemoryRepository, snapshots } from '@ddd-ts-kit/testing';
import { RetentionPeriod } from '@/contexts/data-protection/domain/aggregates/retention-period.aggregate';
import type { RetentionPeriodRepository } from '@/contexts/data-protection/domain/repositories/retention-period.repository';

export class FakeRetentionPeriodRepository
  extends InMemoryRepository<RetentionPeriod>
  implements RetentionPeriodRepository
{
  constructor() {
    super(
      snapshots({
        toSnapshot: (stored: RetentionPeriod) => ({ id: stored.id, state: stored.toState() }),
        fromSnapshot: ({ id, state }) => RetentionPeriod.rehydrate(id, state),
      }),
    );
  }
}
