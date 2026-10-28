import { NamedDomainEvent } from '@ddd-ts-kit/kernel';
import type { LoanSchedule } from '@/contexts/servicing/ledger/domain/value-objects/loan-schedule.vo';

/**
 * The loan was rescheduled: its outstanding capital has a new schedule, over a new duration, at the rate of the loan.
 * The decision is the event that approved it: a decision already recorded is never recorded twice.
 */
export class LoanRescheduled extends NamedDomainEvent('servicing.loan.rescheduled') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    readonly decisionId: string,
    readonly schedule: LoanSchedule,
  ) {
    super();
  }
}
