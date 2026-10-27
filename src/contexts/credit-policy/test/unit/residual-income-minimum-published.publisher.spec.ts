import { describe, expect, it } from '@jest/globals';
import { InMemoryEventBus, SequentialIdGenerator } from '@ddd-ts-kit/kernel';
import { ResidualIncomeMinimumPublishedPublisher } from '@/contexts/credit-policy/application/integration/publishers/residual-income-minimum-published.publisher';
import { ResidualIncomeMinimumPublished } from '@/contexts/credit-policy/domain/events/residual-income-minimum-published.event';

describe('Publishing "residual income minimum published" to other contexts', () => {
  it('publishes version 1 of credit-policy.residual-income-minimum.published', async () => {
    const bus = new InMemoryEventBus();
    const publisher = new ResidualIncomeMinimumPublishedPublisher(bus, new SequentialIdGenerator('event'));

    await publisher.handle(
      new ResidualIncomeMinimumPublished('residual-income-minimum-1', new Date('2026-01-01T00:00:00.000Z')),
    );

    expect(bus.published).toEqual([
      {
        id: 'event-1',
        type: 'credit-policy.residual-income-minimum.published',
        version: 1,
        occurredAt: '2026-01-01T00:00:00.000Z',
        payload: { residualIncomeMinimumId: 'residual-income-minimum-1' },
      },
    ]);
  });

  it('publishes each one with its own identifier', async () => {
    const bus = new InMemoryEventBus();
    const publisher = new ResidualIncomeMinimumPublishedPublisher(bus, new SequentialIdGenerator('event'));

    await publisher.handle(new ResidualIncomeMinimumPublished('first-1', new Date('2026-01-01T00:00:00.000Z')));
    await publisher.handle(new ResidualIncomeMinimumPublished('second-2', new Date('2026-01-01T00:00:00.000Z')));

    expect(bus.published.map((event) => event.payload)).toEqual([
      { residualIncomeMinimumId: 'first-1' },
      { residualIncomeMinimumId: 'second-2' },
    ]);
  });
});
