import { describe, expect, it } from '@jest/globals';
import { rateGridPublishedV2 } from '@/contexts/credit-policy/published-language';
import { rateGridRowOf } from '@/contexts/credit-application/offer/application/projections/rate-grid-row-of.projection';

describe('Rate grid row, read from what credit-policy publishes', () => {
  it('keeps the grid identifier, its product and the day it takes effect', () => {
    const event = rateGridPublishedV2.create(
      { rateGridId: 'rate-grid-1', productId: 'personal-loan', effectiveFrom: '2026-01-01', rates: [] },
      { id: 'event-1', occurredAt: '2026-01-01T00:00:00.000Z' },
    );

    expect(rateGridRowOf(event.payload)).toEqual({
      rateGridId: 'rate-grid-1',
      productId: 'personal-loan',
      effectiveFrom: new Date('2026-01-01'),
      rates: [],
    });
  });
});
