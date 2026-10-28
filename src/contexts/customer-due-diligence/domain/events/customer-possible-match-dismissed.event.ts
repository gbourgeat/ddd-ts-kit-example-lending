import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

/** Compliance cleared a possible match, with the reason it gives. */
export class CustomerPossibleMatchDismissed extends NamedDomainEvent(
  'customer-due-diligence.customer.possible-match-dismissed',
) {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    readonly reason: string,
  ) {
    super();
  }
}
