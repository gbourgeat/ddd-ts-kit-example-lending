import { describe, expect, it } from '@jest/globals';
import { legalMaximumRatePublishedV2 } from '@/contexts/credit-policy/published-language';
import { legalMaximumRateRowOf } from '@/contexts/credit-application/offer/application/projections/legal-maximum-rate-row-of.projection';

describe('Legal maximum rate row, read from what credit-policy publishes', () => {
  it('keeps the maximum identifier, its category, its rate and the day it takes effect', () => {
    const event = legalMaximumRatePublishedV2.create(
      { legalMaximumRateId: 'maximum-1', category: 'car', rateBasisPoints: 1250, effectiveFrom: '2026-01-01' },
      { id: 'event-1', occurredAt: '2026-01-01T00:00:00.000Z' },
    );

    expect(legalMaximumRateRowOf(event.payload)).toEqual({
      legalMaximumRateId: 'maximum-1',
      category: 'car',
      rateBasisPoints: 1250,
      effectiveFrom: new Date('2026-01-01'),
    });
  });
});
