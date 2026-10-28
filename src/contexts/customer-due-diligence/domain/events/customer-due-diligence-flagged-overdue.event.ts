import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

/** The due diligence of a customer is flagged overdue: its refresh is past its date, and no credit is disbursed until it is done. */
export class CustomerDueDiligenceFlaggedOverdue extends NamedDomainEvent(
  'customer-due-diligence.customer.due-diligence-flagged-overdue',
) {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
  ) {
    super();
  }
}
