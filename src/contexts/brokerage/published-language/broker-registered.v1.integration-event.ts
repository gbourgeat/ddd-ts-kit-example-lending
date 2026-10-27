import { defineIntegrationEvent } from '@ddd-ts-kit/events';
import type { IntegrationEvent } from '@ddd-ts-kit/kernel';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { BrokerRegisteredV1Payload } from '@/contexts/brokerage/published-language/broker-registered.v1.payload';

export const brokerRegisteredV1 = defineIntegrationEvent({
  type: 'brokerage.broker.registered',
  version: 1,
  description: 'A broker is registered with the bank and may bring applications.',
  payload: classSchema(BrokerRegisteredV1Payload),
});

export type BrokerRegisteredV1 = IntegrationEvent<BrokerRegisteredV1Payload>;
