import { describe, expect, it } from '@jest/globals';
import { BrokerRegistrationLapsed } from '@/contexts/brokerage/domain/events/broker-registration-lapsed.event';

describe('BrokerRegistrationLapsed', () => {
  it('is named after the context, the aggregate and the fact', () => {
    const event = new BrokerRegistrationLapsed('broker-1', new Date('2026-01-01T00:00:00.000Z'));

    expect(event.name).toBe('brokerage.broker.registration-lapsed');
    expect(event.aggregateId).toBe('broker-1');
  });
});
