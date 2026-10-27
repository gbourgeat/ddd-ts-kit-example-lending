import { describe, expect, it } from '@jest/globals';
import { InMemoryEventBus, SequentialIdGenerator } from '@ddd-ts-kit/kernel';
import { ProductDefinedPublisher } from '@/contexts/credit-policy/application/integration/publishers/product-defined.publisher';
import { ProductDefined } from '@/contexts/credit-policy/domain/events/product-defined.event';

describe('Publishing "product defined" to other contexts', () => {
  it('publishes version 1 of credit-policy.product.defined', async () => {
    const bus = new InMemoryEventBus();
    const publisher = new ProductDefinedPublisher(bus, new SequentialIdGenerator('event'));

    await publisher.handle(new ProductDefined('product-1', new Date('2026-01-01T00:00:00.000Z')));

    expect(bus.published).toEqual([
      {
        id: 'event-1',
        type: 'credit-policy.product.defined',
        version: 1,
        occurredAt: '2026-01-01T00:00:00.000Z',
        payload: { productId: 'product-1' },
      },
    ]);
  });

  it('publishes each one with its own identifier', async () => {
    const bus = new InMemoryEventBus();
    const publisher = new ProductDefinedPublisher(bus, new SequentialIdGenerator('event'));

    await publisher.handle(new ProductDefined('first-1', new Date('2026-01-01T00:00:00.000Z')));
    await publisher.handle(new ProductDefined('second-2', new Date('2026-01-01T00:00:00.000Z')));

    expect(bus.published.map((event) => event.payload)).toEqual([{ productId: 'first-1' }, { productId: 'second-2' }]);
  });
});
