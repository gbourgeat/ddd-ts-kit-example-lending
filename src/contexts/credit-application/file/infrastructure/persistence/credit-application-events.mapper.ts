import { defineStoredEvent, type StoredEventTypes } from '@ddd-ts-kit/kernel';
import type { CreditApplicationEvent } from '@/contexts/credit-application/file/domain/aggregates/credit-application.aggregate';
import { CreditApplicationSubmitted } from '@/contexts/credit-application/file/domain/events/credit-application-submitted.event';

interface CreditApplicationSubmittedData {
  readonly applicantId: string;
}

/** How the events of CreditApplication are kept in its stream: one entry per event, read back by `decode`. */
export const creditApplicationEvents: StoredEventTypes<CreditApplicationEvent> = {
  [CreditApplicationSubmitted.eventName]: defineStoredEvent(CreditApplicationSubmitted, {
    version: 1,
    encode: (event): CreditApplicationSubmittedData => ({ applicantId: event.applicantId }),
    decode: (data, { aggregateId, occurredAt }) =>
      new CreditApplicationSubmitted(aggregateId, data.text('applicantId'), occurredAt),
  }),
};
