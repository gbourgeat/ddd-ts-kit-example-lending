import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

/** The loan was declared in default, 90 days past due: it is handed to collections. */
export class LoanDefaulted extends NamedDomainEvent('servicing.loan.defaulted') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
  ) {
    super();
  }
}
