import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

export class CustomerPossibleMatchFound extends NamedDomainEvent(
  'customer-due-diligence.customer.possible-match-found',
) {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
  ) {
    super();
  }
}
