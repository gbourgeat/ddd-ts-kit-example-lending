import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

export class BrokerRegistered extends NamedDomainEvent('brokerage.broker.registered') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
  ) {
    super();
  }
}
