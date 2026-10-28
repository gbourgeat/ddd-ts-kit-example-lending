import { NamedDomainEvent } from '@ddd-ts-kit/kernel';
import type { Money } from '@/shared-kernel/money.vo';

/** An instalment of the schedule was noted as due: its number in the schedule, its due date and its amount. */
export class LoanInstalmentDueNoted extends NamedDomainEvent('servicing.loan.instalment-due-noted') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    readonly number: number,
    readonly dueOn: Date,
    readonly amount: Money,
  ) {
    super();
  }
}
