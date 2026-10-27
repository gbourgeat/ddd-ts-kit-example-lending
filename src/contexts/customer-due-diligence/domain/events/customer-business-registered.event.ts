import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

export class CustomerBusinessRegistered extends NamedDomainEvent(
  'customer-due-diligence.customer.business-registered',
) {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    // TODO(domain): add as readonly parameters the facts a reaction needs to know about "customer business registered" (value objects or primitives, never the aggregate itself).
  ) {
    super();
  }
}
