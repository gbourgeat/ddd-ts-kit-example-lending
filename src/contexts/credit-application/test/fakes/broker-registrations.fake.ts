import { InMemoryReadModelStore } from '@ddd-ts-kit/kernel';
import type {
  BrokerRegistrationRow,
  BrokerRegistrations,
} from '@/contexts/credit-application/file/application/ports/broker-registrations.port';
import { brokerRegistrationCriteria } from '@/contexts/credit-application/file/application/projections/broker-registration-criteria.projection';

/** The broker registrations read model in memory: the reference semantics of its criteria, and of the stamps. */
export class FakeBrokerRegistrations
  extends InMemoryReadModelStore<BrokerRegistrationRow>
  implements BrokerRegistrations
{
  constructor() {
    super(brokerRegistrationCriteria);
  }
}
