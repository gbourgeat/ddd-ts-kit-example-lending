import { NamedDomainEvent } from '@ddd-ts-kit/kernel';
import type { Money } from '@/shared-kernel/money.vo';

/** The outstanding capital of the loan is written off: the loan ends, until the write-off is reversed. */
export class LoanWrittenOff extends NamedDomainEvent('servicing.loan.written-off') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    readonly amount: Money,
  ) {
    super();
  }
}
