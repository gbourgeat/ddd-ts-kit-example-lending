import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

export class CustomerRelationshipEnded extends NamedDomainEvent('customer-due-diligence.customer.relationship-ended') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
  ) {
    super();
  }
}
