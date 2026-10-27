import { describe, expect, it } from '@jest/globals';
import { InMemoryEventBus, SequentialIdGenerator } from '@ddd-ts-kit/kernel';
import { BrokerRegistrationLapsedPublisher } from '@/contexts/brokerage/application/integration/publishers/broker-registration-lapsed.publisher';
import { BrokerRegistrationLapsed } from '@/contexts/brokerage/domain/events/broker-registration-lapsed.event';

describe('Publishing "broker registration lapsed" to other contexts', () => {
  it('publishes version 1 of brokerage.broker.registration-lapsed', async () => {
    const bus = new InMemoryEventBus();
    const publisher = new BrokerRegistrationLapsedPublisher(bus, new SequentialIdGenerator('event'));

    await publisher.handle(new BrokerRegistrationLapsed('broker-1', new Date('2026-01-01T00:00:00.000Z')));

    expect(bus.published).toEqual([
      {
        id: 'event-1',
        type: 'brokerage.broker.registration-lapsed',
        version: 1,
        occurredAt: '2026-01-01T00:00:00.000Z',
        payload: { brokerId: 'broker-1' },
      },
    ]);
  });
});
