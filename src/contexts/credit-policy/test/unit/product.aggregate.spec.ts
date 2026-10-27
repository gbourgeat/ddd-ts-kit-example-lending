import { describe, expect, it } from '@jest/globals';
import { ProductDefined } from '@/contexts/credit-policy/domain/events/product-defined.event';
import { Product } from '@/contexts/credit-policy/domain/aggregates/product.aggregate';
import { aProduct } from '@/contexts/credit-policy/test/builders/product.builder';

describe('Product', () => {
  it('is born with its identity and what it holds', () => {
    const bornAt = new Date('2026-03-01T00:00:00.000Z');

    const born = aProduct().identifiedBy('product-7').bornAt(bornAt).build();

    expect(born.id).toBe('product-7');
    expect(born.registeredAt).toEqual(bornAt);
  });

  it('records the fact that it is defined', () => {
    const bornAt = new Date('2026-03-01T00:00:00.000Z');

    const recorded = aProduct().identifiedBy('product-7').bornAt(bornAt).build();

    expect(recorded.pullEvents()).toEqual([new ProductDefined('product-7', bornAt)]);
  });

  it('is rehydrated in its stored state without recording a new fact', () => {
    const stored = aProduct().build();

    const loaded = Product.rehydrate(stored.id, stored.toState());

    expect(loaded.toState()).toEqual(stored.toState());
    expect(loaded.pullEvents()).toEqual([]);
  });
});
