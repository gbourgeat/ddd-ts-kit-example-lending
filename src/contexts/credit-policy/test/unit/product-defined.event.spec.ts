import { describe, expect, it } from '@jest/globals';
import { ProductDefined } from '@/contexts/credit-policy/domain/events/product-defined.event';

const terms = {
  amountMinimumCents: 100_000,
  amountMaximumCents: 2_500_000,
  durationMinimumMonths: 12,
  durationMaximumMonths: 84,
  arrangementFeeCents: 4_500,
  insuranceMandatory: true,
};

describe('ProductDefined', () => {
  it('is named after the context, the aggregate and the fact', () => {
    const event = new ProductDefined('product-1', new Date('2026-01-01T00:00:00.000Z'), terms);

    expect(event.name).toBe('credit-policy.product.defined');
    expect(event.aggregateId).toBe('product-1');
  });
});
