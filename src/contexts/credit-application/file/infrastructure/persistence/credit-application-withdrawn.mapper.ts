import { defineStoredEvent } from '@ddd-ts-kit/kernel';
import { CreditApplicationWithdrawn } from '@/contexts/credit-application/offer/domain/events/credit-application-withdrawn.event';

/** The withdrawal stores no data of its own: its instant is the event's. */
type CreditApplicationWithdrawnData = Record<string, never>;

/** How the withdrawal is kept in the stream of its application: the instant alone, the facts it rests on are kept by the file. */
export const creditApplicationWithdrawnStored = defineStoredEvent(CreditApplicationWithdrawn, {
  version: 1,
  encode: (): CreditApplicationWithdrawnData => ({}),
  decode: (_data, { aggregateId, occurredAt }) => new CreditApplicationWithdrawn(aggregateId, occurredAt),
});
