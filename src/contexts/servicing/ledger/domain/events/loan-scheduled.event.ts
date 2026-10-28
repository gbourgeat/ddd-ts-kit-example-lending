import { NamedDomainEvent } from '@ddd-ts-kit/kernel';
import type { LoanSchedule } from '@/contexts/servicing/ledger/domain/value-objects/loan-schedule.vo';

/** The loan has its schedule: its constant monthly instalments, recorded right after its payout. */
export class LoanScheduled extends NamedDomainEvent('servicing.loan.scheduled') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    readonly schedule: LoanSchedule,
  ) {
    super();
  }
}
