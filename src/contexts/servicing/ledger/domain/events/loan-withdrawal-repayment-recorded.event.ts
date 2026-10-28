import { NamedDomainEvent } from '@ddd-ts-kit/kernel';
import type { Money } from '@/shared-kernel/money.vo';

/** The borrower withdrew after the payout and repaid the loan: the capital as paid out, and the interest accrued since the payout. */
export class LoanWithdrawalRepaymentRecorded extends NamedDomainEvent('servicing.loan.withdrawal-repayment-recorded') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    readonly capital: Money,
    readonly interest: Money,
  ) {
    super();
  }
}
