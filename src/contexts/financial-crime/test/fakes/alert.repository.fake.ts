import { InMemoryRepository, snapshots } from '@ddd-ts-kit/testing';
import { Alert } from '@/contexts/financial-crime/domain/aggregates/alert.aggregate';
import type { AlertRepository } from '@/contexts/financial-crime/domain/repositories/alert.repository';

export class FakeAlertRepository extends InMemoryRepository<Alert> implements AlertRepository {
  constructor() {
    super(
      snapshots({
        toSnapshot: (stored: Alert) => ({ id: stored.id, state: stored.toState() }),
        fromSnapshot: ({ id, state }) => Alert.rehydrate(id, state),
      }),
    );
  }

  async findByRepaymentReference(repaymentReference: string): Promise<Alert | undefined> {
    return this.all().find((alert) => alert.repaymentReference === repaymentReference);
  }
}
