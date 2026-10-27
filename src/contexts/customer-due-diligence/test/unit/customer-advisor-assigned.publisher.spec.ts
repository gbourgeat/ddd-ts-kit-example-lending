import { describe, expect, it } from '@jest/globals';
import { InMemoryEventBus, SequentialIdGenerator } from '@ddd-ts-kit/kernel';
import { CustomerAdvisorAssignedPublisher } from '@/contexts/customer-due-diligence/application/integration/publishers/customer-advisor-assigned.publisher';
import { CustomerAdvisorAssigned } from '@/contexts/customer-due-diligence/domain/events/customer-advisor-assigned.event';

describe('Publishing "customer advisor assigned" to other contexts', () => {
  it('publishes version 1 of customer-due-diligence.customer.advisor-assigned', async () => {
    const bus = new InMemoryEventBus();
    const publisher = new CustomerAdvisorAssignedPublisher(bus, new SequentialIdGenerator('event'));

    await publisher.handle(new CustomerAdvisorAssigned('customer-1', new Date('2026-01-01T00:00:00.000Z')));

    expect(bus.published).toEqual([
      {
        id: 'event-1',
        type: 'customer-due-diligence.customer.advisor-assigned',
        version: 1,
        occurredAt: '2026-01-01T00:00:00.000Z',
        payload: { customerId: 'customer-1' },
      },
    ]);
  });

  // TODO(domain): once the payload has its fields, assert each of them here: this test is the contract other contexts rely on.
  it.todo('carries every field of the public payload');
});
