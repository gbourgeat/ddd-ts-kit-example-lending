import { describe, expect, it } from '@jest/globals';
import { InMemoryEventBus, SequentialIdGenerator } from '@ddd-ts-kit/kernel';
import { RateGridPublishedPublisher } from '@/contexts/credit-policy/application/integration/publishers/rate-grid-published.publisher';
import { RateGridPublished } from '@/contexts/credit-policy/domain/events/rate-grid-published.event';

describe('Publishing "rate grid published" to other contexts', () => {
  it('publishes version 2 of credit-policy.rate-grid.published with its product and date of effect', async () => {
    const bus = new InMemoryEventBus();
    const publisher = new RateGridPublishedPublisher(bus, new SequentialIdGenerator('event'));

    await publisher.handle(
      new RateGridPublished('rate-grid-1', new Date('2026-01-01T00:00:00.000Z'), {
        productId: 'personal-loan',
        effectiveFrom: new Date('2026-03-01T00:00:00.000Z'),
      }),
    );

    expect(bus.published).toEqual([
      {
        id: 'event-1',
        type: 'credit-policy.rate-grid.published',
        version: 2,
        occurredAt: '2026-01-01T00:00:00.000Z',
        payload: { rateGridId: 'rate-grid-1', productId: 'personal-loan', effectiveFrom: '2026-03-01' },
      },
    ]);
  });

  it('publishes each one with its own identifier', async () => {
    const bus = new InMemoryEventBus();
    const publisher = new RateGridPublishedPublisher(bus, new SequentialIdGenerator('event'));
    const publication = { productId: 'car-loan', effectiveFrom: new Date('2026-03-01T00:00:00.000Z') };

    await publisher.handle(new RateGridPublished('first-1', new Date('2026-01-01T00:00:00.000Z'), publication));
    await publisher.handle(new RateGridPublished('second-2', new Date('2026-01-01T00:00:00.000Z'), publication));

    expect(bus.published.map((event) => event.payload)).toEqual([
      { rateGridId: 'first-1', productId: 'car-loan', effectiveFrom: '2026-03-01' },
      { rateGridId: 'second-2', productId: 'car-loan', effectiveFrom: '2026-03-01' },
    ]);
  });
});
