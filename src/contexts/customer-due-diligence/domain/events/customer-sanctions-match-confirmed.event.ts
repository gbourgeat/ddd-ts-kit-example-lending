import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

export class CustomerSanctionsMatchConfirmed extends NamedDomainEvent(
  'customer-due-diligence.customer.sanctions-match-confirmed',
) {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
  ) {
    super();
  }
}
