import { defineStoredEvent } from '@ddd-ts-kit/kernel';
import { CreditApplicationPayoutAuthorised } from '@/contexts/credit-application/offer/domain/events/credit-application-payout-authorised.event';

/** The payout authorisation stores no data of its own: its instant is the event's. */
type CreditApplicationPayoutAuthorisedData = Record<string, never>;

/** How the payout authorisation is kept in the stream of its application: the instant alone. */
export const creditApplicationPayoutAuthorisedStored = defineStoredEvent(CreditApplicationPayoutAuthorised, {
  version: 1,
  encode: (): CreditApplicationPayoutAuthorisedData => ({}),
  decode: (_data, { aggregateId, occurredAt }) => new CreditApplicationPayoutAuthorised(aggregateId, occurredAt),
});
