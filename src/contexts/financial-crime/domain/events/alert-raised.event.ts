import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

export class AlertRaised extends NamedDomainEvent('financial-crime.alert.raised') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
  ) {
    super();
  }
}
