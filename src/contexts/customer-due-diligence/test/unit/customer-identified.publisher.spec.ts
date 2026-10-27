import { describe, expect, it } from '@jest/globals';
import { InMemoryEventBus, SequentialIdGenerator } from '@ddd-ts-kit/kernel';
import { CustomerIdentifiedPublisher } from '@/contexts/customer-due-diligence/application/integration/publishers/customer-identified.publisher';
import { CustomerIdentified } from '@/contexts/customer-due-diligence/domain/events/customer-identified.event';
import { aPersonIdentity } from '@/contexts/customer-due-diligence/test/builders/customer.builder';

describe('Publishing "customer identified" to other contexts', () => {
  it('publishes version 1 of customer-due-diligence.customer.identified', async () => {
    const bus = new InMemoryEventBus();
    const publisher = new CustomerIdentifiedPublisher(bus, new SequentialIdGenerator('event'));

    await publisher.handle(
      new CustomerIdentified('customer-1', new Date('2026-01-01T00:00:00.000Z'), aPersonIdentity()),
    );

    expect(bus.published).toEqual([
      {
        id: 'event-1',
        type: 'customer-due-diligence.customer.identified',
        version: 1,
        occurredAt: '2026-01-01T00:00:00.000Z',
        payload: { customerId: 'customer-1' },
      },
    ]);
  });
});
