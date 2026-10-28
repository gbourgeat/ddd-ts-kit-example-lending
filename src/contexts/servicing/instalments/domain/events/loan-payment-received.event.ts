import { NamedDomainEvent } from '@ddd-ts-kit/kernel';
import type { Money } from '@/shared-kernel/money.vo';

/** The money of an instalment received by direct debit: its number in the schedule and the amount collected. */
export class LoanPaymentReceived extends NamedDomainEvent('servicing.loan.payment-received') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    readonly number: number,
    readonly amount: Money,
  ) {
    super();
  }
}
