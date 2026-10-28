import { describe, expect, it } from '@jest/globals';
import { rateGridPublishedV2 } from '@/contexts/credit-policy/published-language';
import { RateGridProjection } from '@/contexts/credit-application/offer/application/projections/rate-grid.projection';

describe('Rate grid, kept from what credit-policy announces', () => {
  it('receives credit-policy.rate-grid.published as credit-policy publishes it', async () => {
    const projection = new RateGridProjection();

    // TODO(domain): give the payload every field credit-policy declares, hand the projection the fake of its read model and assert the line it keeps.
    const event = rateGridPublishedV2.create(
      { rateGridId: 'rate-grid-1', productId: 'product-1', effectiveFrom: '2026-01-01' },
      { id: 'event-1', occurredAt: '2026-01-01T00:00:00.000Z' },
    );

    await expect(projection.published(event)).resolves.toBeUndefined();
  });

  // TODO(domain): replace each entry below by a test that publishes events through the test application, with the fake of the read model bound to its port, and asserts the line that is kept.
  it.todo('keeps the same line when the same event is delivered twice');
  it.todo('keeps the newest line when an older event is delivered late');
});
