import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

/** An instalment marked unpaid after its direct debit was rejected: its number in the schedule. It is not retried. */
export class LoanInstalmentMarkedUnpaid extends NamedDomainEvent('servicing.loan.instalment-marked-unpaid') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    readonly number: number,
  ) {
    super();
  }
}
