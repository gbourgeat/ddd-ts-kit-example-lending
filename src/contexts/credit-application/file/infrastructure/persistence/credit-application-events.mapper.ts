import { defineStoredEvent, type StoredEventTypes } from '@ddd-ts-kit/kernel';
import { Money } from '@/shared-kernel/money.vo';
import type { CreditApplicationEvent } from '@/contexts/credit-application/file/domain/aggregates/credit-application.aggregate';
import { CreditApplicationSubmitted } from '@/contexts/credit-application/file/domain/events/credit-application-submitted.event';

interface CreditApplicationSubmittedData {
  readonly applicantId: string;
  readonly amountInCents: number;
  readonly durationMonths: number;
}

/** How the events of CreditApplication are kept in its stream: one entry per event, read back by `decode`. */
export const creditApplicationEvents: StoredEventTypes<CreditApplicationEvent> = {
  [CreditApplicationSubmitted.eventName]: defineStoredEvent(CreditApplicationSubmitted, {
    version: 1,
    encode: (event): CreditApplicationSubmittedData => ({
      applicantId: event.applicantId,
      amountInCents: event.amount.cents,
      durationMonths: event.durationMonths,
    }),
    decode: (data, { aggregateId, occurredAt }) =>
      new CreditApplicationSubmitted(
        aggregateId,
        data.text('applicantId'),
        Money.ofCents(data.number('amountInCents')),
        data.number('durationMonths'),
        occurredAt,
      ),
  }),
};
