import { describe, expect, it } from '@jest/globals';
import { BrokerRegistered } from '@/contexts/brokerage/domain/events/broker-registered.event';

describe('BrokerRegistered', () => {
  it('is named after the context, the aggregate and the fact', () => {
    const event = new BrokerRegistered('broker-1', new Date('2026-01-01T00:00:00.000Z'));

    expect(event.name).toBe('brokerage.broker.registered');
    expect(event.aggregateId).toBe('broker-1');
  });
});
