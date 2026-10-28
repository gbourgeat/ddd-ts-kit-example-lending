import { describe, expect, it } from '@jest/globals';
import { RateGridPublished } from '@/contexts/credit-policy/domain/events/rate-grid-published.event';
import { RateGrid } from '@/contexts/credit-policy/domain/aggregates/rate-grid.aggregate';
import { aRateGrid } from '@/contexts/credit-policy/test/builders/rate-grid.builder';

describe('RateGrid', () => {
  it('is born with its identity and what it holds', () => {
    const bornAt = new Date('2026-03-01T00:00:00.000Z');

    const born = aRateGrid().identifiedBy('rate-grid-7').bornAt(bornAt).build();

    expect(born.id).toBe('rate-grid-7');
    expect(born.registeredAt).toEqual(bornAt);
  });

  it('records the fact that it is published', () => {
    const bornAt = new Date('2026-03-01T00:00:00.000Z');

    const recorded = aRateGrid().identifiedBy('rate-grid-7').bornAt(bornAt).build();

    expect(recorded.pullEvents()).toEqual([
      new RateGridPublished('rate-grid-7', bornAt, {
        productId: recorded.productId,
        effectiveFrom: recorded.effectiveFrom,
        rates: [],
      }),
    ]);
  });

  it('is rehydrated in its stored state without recording a new fact', () => {
    const stored = aRateGrid().build();

    const loaded = RateGrid.rehydrate(stored.id, stored.toState());

    expect(loaded.toState()).toEqual(stored.toState());
    expect(loaded.pullEvents()).toEqual([]);
  });
});

describe('aRateGrid exposes what it holds', () => {
  it('gives back each fact the aggregate was born with', () => {
    const built = aRateGrid().build();

    expect(built.productId).toEqual('product-1');
    expect(built.effectiveFrom).toEqual(new Date('2026-01-01T00:00:00.000Z'));
  });
});
