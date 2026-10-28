import { NamedDomainEvent } from '@ddd-ts-kit/kernel';
import type { Borrower } from '@/contexts/servicing/ledger/domain/value-objects/borrower.vo';

/** The money of the loan is paid out to its borrower, and its schedule starts. */
export class LoanPaidOut extends NamedDomainEvent('servicing.loan.paid-out') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    readonly borrower?: Borrower,
  ) {
    super();
  }
}
