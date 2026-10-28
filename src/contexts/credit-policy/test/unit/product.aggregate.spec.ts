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

  it('is born holding the amounts, durations, arrangement fee and insurance it is defined with', () => {
    const born = aProduct().insuranceMandatory(true).build();

    expect(born.amountMinimumCents).toBe(100_000);
    expect(born.amountMaximumCents).toBe(2_500_000);
    expect(born.durationMinimumMonths).toBe(12);
    expect(born.durationMaximumMonths).toBe(84);
    expect(born.arrangementFeeCents).toBe(4_500);
    expect(born.insuranceMandatory).toBe(true);
  });

  it('records the fact that it is defined', () => {
    const bornAt = new Date('2026-03-01T00:00:00.000Z');

    const recorded = aProduct().identifiedBy('product-7').bornAt(bornAt).build();

    expect(recorded.pullEvents()).toEqual([
      new ProductDefined('product-7', bornAt, {
        amountMinimumCents: 100_000,
        amountMaximumCents: 2_500_000,
        durationMinimumMonths: 12,
        durationMaximumMonths: 84,
        arrangementFeeCents: 4_500,
        insuranceMandatory: false,
      }),
    ]);
  });

  it('is rehydrated in its stored state without recording a new fact', () => {
    const stored = aProduct().build();

    const loaded = Product.rehydrate(stored.id, stored.toState());

    expect(loaded.toState()).toEqual(stored.toState());
    expect(loaded.pullEvents()).toEqual([]);
  });
});

describe('aProduct exposes what it holds', () => {
  it('gives back each fact the aggregate was born with', () => {
    const built = aProduct().build();

    expect(built.scoreThreshold).toEqual(600);
  });
});
