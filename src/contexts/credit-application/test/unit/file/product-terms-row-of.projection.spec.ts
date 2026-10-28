import { describe, expect, it } from '@jest/globals';
import { productDefinedV2 } from '@/contexts/credit-policy/published-language';
import { productTermsRowOf } from '@/contexts/credit-application/file/application/projections/product-terms-row-of.projection';

describe('Product terms row, read from what credit-policy publishes', () => {
  it('keeps the product and every term credit-policy defined for it', () => {
    const event = productDefinedV2.create(
      {
        productId: 'product-1',
        amountMinimumCents: 100_000,
        amountMaximumCents: 2_500_000,
        durationMinimumMonths: 12,
        durationMaximumMonths: 84,
        arrangementFeeCents: 4_500,
        insuranceMandatory: true,
      },
      { id: 'event-1', occurredAt: '2026-01-01T00:00:00.000Z' },
    );

    expect(productTermsRowOf(event.payload)).toEqual({
      productId: 'product-1',
      amountMinimumCents: 100_000,
      amountMaximumCents: 2_500_000,
      durationMinimumMonths: 12,
      durationMaximumMonths: 84,
      arrangementFeeCents: 4_500,
      insuranceMandatory: true,
    });
  });
});
