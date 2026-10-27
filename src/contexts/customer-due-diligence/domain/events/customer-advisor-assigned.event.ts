import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

export class CustomerAdvisorAssigned extends NamedDomainEvent('customer-due-diligence.customer.advisor-assigned') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    readonly advisorId: string,
  ) {
    super();
  }
}
