import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

/** The ledger of a loan is over: it was paid in full or repaid early. */
export class LoanClosed extends NamedDomainEvent('servicing.loan.closed') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
  ) {
    super();
  }
}
