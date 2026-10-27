import { InMemoryRepository, snapshots } from '@ddd-ts-kit/testing';
import { Broker } from '@/contexts/brokerage/domain/aggregates/broker.aggregate';
import type { BrokerRepository } from '@/contexts/brokerage/domain/repositories/broker.repository';

export class FakeBrokerRepository extends InMemoryRepository<Broker> implements BrokerRepository {
  constructor() {
    super(
      snapshots({
        toSnapshot: (stored: Broker) => ({ id: stored.id, state: stored.toState() }),
        fromSnapshot: ({ id, state }) => Broker.rehydrate(id, state),
      }),
    );
  }

  async findNotLapsed(): Promise<Broker[]> {
    return this.all().filter((broker) => broker.lapsedOn === undefined);
  }
}
