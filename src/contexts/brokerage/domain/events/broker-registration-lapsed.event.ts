import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

export class BrokerRegistrationLapsed extends NamedDomainEvent('brokerage.broker.registration-lapsed') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
  ) {
    super();
  }
}
