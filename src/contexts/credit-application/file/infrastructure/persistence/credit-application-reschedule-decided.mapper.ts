import { defineStoredEvent } from '@ddd-ts-kit/kernel';
import { CreditApplicationRescheduleDecided } from '@/contexts/credit-application/decision/domain/events/credit-application-reschedule-decided.event';

interface CreditApplicationRescheduleDecidedData {
  readonly deciderId: string;
  readonly level: string;
  readonly durationMonths: number;
  readonly outstandingAmountCents: number;
}

/** How the rescheduling decided is kept in the stream of its application: the decider, the level, the new duration and the outstanding amount. */
export const creditApplicationRescheduleDecidedStored = defineStoredEvent(CreditApplicationRescheduleDecided, {
  version: 1,
  encode: (event): CreditApplicationRescheduleDecidedData => ({
    deciderId: event.deciderId,
    level: event.level,
    durationMonths: event.durationMonths,
    outstandingAmountCents: event.outstandingAmountCents,
  }),
  decode: (data, { aggregateId, occurredAt }) =>
    new CreditApplicationRescheduleDecided(
      aggregateId,
      occurredAt,
      data.text('deciderId'),
      data.text('level'),
      data.number('durationMonths'),
      data.number('outstandingAmountCents'),
    ),
});
