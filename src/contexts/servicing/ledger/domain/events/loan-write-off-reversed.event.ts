import { NamedDomainEvent } from '@ddd-ts-kit/kernel';
import type { Money } from '@/shared-kernel/money.vo';

/** A write-off is reversed by a movement of opposite effect: the amount written off is open again. */
export class LoanWriteOffReversed extends NamedDomainEvent('servicing.loan.write-off-reversed') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    readonly amount: Money,
  ) {
    super();
  }
}
