import { Repository } from '@ddd-ts-kit/kernel';
import type { Broker } from '@/contexts/brokerage/domain/aggregates/broker.aggregate';

export abstract class BrokerRepository extends Repository<Broker> {
  /** The brokers of the tenant of the work whose registration is not marked lapsed. */
  abstract findNotLapsed(): Promise<Broker[]>;
}
