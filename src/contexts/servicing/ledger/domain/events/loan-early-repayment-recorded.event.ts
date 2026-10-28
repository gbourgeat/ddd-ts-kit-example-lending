import { NamedDomainEvent } from '@ddd-ts-kit/kernel';
import type { Money } from '@/shared-kernel/money.vo';

/** Capital was repaid early: the capital repaid, and the fee charged on it. */
export class LoanEarlyRepaymentRecorded extends NamedDomainEvent('servicing.loan.early-repayment-recorded') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    readonly capital: Money,
    readonly fee: Money,
  ) {
    super();
  }
}
