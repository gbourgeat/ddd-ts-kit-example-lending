import { defineIntegrationEvent } from '@ddd-ts-kit/events';
import type { IntegrationEvent } from '@ddd-ts-kit/kernel';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { BrokerRegistrationLapsedV1Payload } from '@/contexts/brokerage/published-language/broker-registration-lapsed.v1.payload';

export const brokerRegistrationLapsedV1 = defineIntegrationEvent({
  type: 'brokerage.broker.registration-lapsed',
  version: 1,
  description:
    'The registration of a broker lapsed: the broker may no longer bring applications until registered again.',
  payload: classSchema(BrokerRegistrationLapsedV1Payload),
});

export type BrokerRegistrationLapsedV1 = IntegrationEvent<BrokerRegistrationLapsedV1Payload>;
