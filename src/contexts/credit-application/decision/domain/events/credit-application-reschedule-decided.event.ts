import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

/** The decider decided a rescheduling of the approved application: the new duration in months, the outstanding amount it reschedules, and the decider with the level it decided at. The rate and the amount stay. */
export class CreditApplicationRescheduleDecided extends NamedDomainEvent(
  'credit-application.credit-application.reschedule-decided',
) {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    readonly deciderId: string,
    readonly level: string,
    /** The new duration of the schedule, in whole months. */
    readonly durationMonths: number,
    /** The outstanding capital rescheduled, in cents. */
    readonly outstandingAmountCents: number,
  ) {
    super();
  }
}
