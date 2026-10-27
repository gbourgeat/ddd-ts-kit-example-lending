import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

export class CustomerIdentified extends NamedDomainEvent('customer-due-diligence.customer.identified') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
  ) {
    super();
  }
}
