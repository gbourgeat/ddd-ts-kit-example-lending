import { defineStoredEvent } from '@ddd-ts-kit/kernel';
import { CreditApplicationContested } from '@/contexts/credit-application/file/domain/events/credit-application-contested.event';

interface CreditApplicationContestedData {
  readonly requesterId: string;
  readonly reason: string;
}

/** How the contestation of the decision is kept in the stream of its application: the requester and the reason. */
export const creditApplicationContestedStored = defineStoredEvent(CreditApplicationContested, {
  version: 1,
  encode: (event): CreditApplicationContestedData => ({ requesterId: event.requesterId, reason: event.reason }),
  decode: (data, { aggregateId, occurredAt }) =>
    new CreditApplicationContested(aggregateId, occurredAt, data.text('requesterId'), data.text('reason')),
});
