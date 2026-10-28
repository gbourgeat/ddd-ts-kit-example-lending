import { describe, expect, it } from '@jest/globals';
import { InMemoryEventBus, SequentialIdGenerator } from '@ddd-ts-kit/kernel';
import { ProductDefinedV2Publisher } from '@/contexts/credit-policy/application/integration/publishers/product-defined-v2.publisher';
import { ProductDefined } from '@/contexts/credit-policy/domain/events/product-defined.event';

const terms = {
  amountMinimumCents: 100_000,
  amountMaximumCents: 2_500_000,
  durationMinimumMonths: 12,
  durationMaximumMonths: 84,
  arrangementFeeCents: 4_500,
  insuranceMandatory: true,
};

describe('Publishing "product defined" to other contexts', () => {
  it('publishes version 2 of credit-policy.product.defined', async () => {
    const bus = new InMemoryEventBus();
    const publisher = new ProductDefinedV2Publisher(bus, new SequentialIdGenerator('event'));

    await publisher.handle(new ProductDefined('product-1', new Date('2026-01-01T00:00:00.000Z'), terms));

    expect(bus.published).toEqual([
      {
        id: 'event-1',
        type: 'credit-policy.product.defined',
        version: 2,
        occurredAt: '2026-01-01T00:00:00.000Z',
        payload: { productId: 'product-1', ...terms },
      },
    ]);
  });
});
