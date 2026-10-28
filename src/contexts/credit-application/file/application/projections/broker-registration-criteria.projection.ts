import { defineCriteria } from '@ddd-ts-kit/kernel';
import type { BrokerRegistrationRow } from '@/contexts/credit-application/file/application/ports/broker-registrations.port';

/** What a read of the broker registrations read model may filter by. */
export const brokerRegistrationCriteria = defineCriteria<BrokerRegistrationRow>({
  fields: {
    brokerId: { type: 'string', filter: ['eq'] },
  },
  tieBreaker: 'brokerId',
});
