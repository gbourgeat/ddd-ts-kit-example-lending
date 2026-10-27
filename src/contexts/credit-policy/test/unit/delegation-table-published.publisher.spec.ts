import { describe, expect, it } from '@jest/globals';
import { InMemoryEventBus, SequentialIdGenerator } from '@ddd-ts-kit/kernel';
import { DelegationTablePublishedPublisher } from '@/contexts/credit-policy/application/integration/publishers/delegation-table-published.publisher';
import { DelegationTablePublished } from '@/contexts/credit-policy/domain/events/delegation-table-published.event';

describe('Publishing "delegation table published" to other contexts', () => {
  it('publishes version 1 of credit-policy.delegation-table.published', async () => {
    const bus = new InMemoryEventBus();
    const publisher = new DelegationTablePublishedPublisher(bus, new SequentialIdGenerator('event'));

    await publisher.handle(new DelegationTablePublished('delegation-table-1', new Date('2026-01-01T00:00:00.000Z')));

    expect(bus.published).toEqual([
      {
        id: 'event-1',
        type: 'credit-policy.delegation-table.published',
        version: 1,
        occurredAt: '2026-01-01T00:00:00.000Z',
        payload: { delegationTableId: 'delegation-table-1' },
      },
    ]);
  });

  it('publishes each one with its own identifier', async () => {
    const bus = new InMemoryEventBus();
    const publisher = new DelegationTablePublishedPublisher(bus, new SequentialIdGenerator('event'));

    await publisher.handle(new DelegationTablePublished('first-1', new Date('2026-01-01T00:00:00.000Z')));
    await publisher.handle(new DelegationTablePublished('second-2', new Date('2026-01-01T00:00:00.000Z')));

    expect(bus.published.map((event) => event.payload)).toEqual([
      { delegationTableId: 'first-1' },
      { delegationTableId: 'second-2' },
    ]);
  });
});
