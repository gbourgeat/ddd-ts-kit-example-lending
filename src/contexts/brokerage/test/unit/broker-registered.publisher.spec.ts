import { describe, expect, it } from '@jest/globals';
import { InMemoryEventBus, SequentialIdGenerator } from '@ddd-ts-kit/kernel';
import { BrokerRegisteredPublisher } from '@/contexts/brokerage/application/integration/publishers/broker-registered.publisher';
import { BrokerRegistered } from '@/contexts/brokerage/domain/events/broker-registered.event';

describe('Publishing "broker registered" to other contexts', () => {
  it('publishes version 1 of brokerage.broker.registered', async () => {
    const bus = new InMemoryEventBus();
    const publisher = new BrokerRegisteredPublisher(bus, new SequentialIdGenerator('event'));

    await publisher.handle(new BrokerRegistered('broker-1', new Date('2026-01-01T00:00:00.000Z')));

    expect(bus.published).toEqual([
      {
        id: 'event-1',
        type: 'brokerage.broker.registered',
        version: 1,
        occurredAt: '2026-01-01T00:00:00.000Z',
        payload: { brokerId: 'broker-1' },
      },
    ]);
  });
});
