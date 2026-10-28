import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

/** The borrower withdrew the application within 14 calendar days of signing its offer, without a reason: recorded once. */
export class CreditApplicationWithdrawn extends NamedDomainEvent('credit-application.credit-application.withdrawn') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
  ) {
    super();
  }
}
