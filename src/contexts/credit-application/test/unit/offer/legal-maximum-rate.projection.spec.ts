import { describe, expect, it } from '@jest/globals';
import { legalMaximumRatePublishedV2 } from '@/contexts/credit-policy/published-language';
import { LegalMaximumRateProjection } from '@/contexts/credit-application/offer/application/projections/legal-maximum-rate.projection';

describe('Legal maximum rate, kept from what credit-policy announces', () => {
  it('receives credit-policy.legal-maximum-rate.published as credit-policy publishes it', async () => {
    const projection = new LegalMaximumRateProjection();

    // TODO(domain): give the payload every field credit-policy declares, hand the projection the fake of its read model and assert the line it keeps.
    const event = legalMaximumRatePublishedV2.create(
      {
        legalMaximumRateId: 'legal-maximum-rate-1',
        category: 'consumer',
        rateBasisPoints: 700,
        effectiveFrom: '2026-01-01',
      },
      { id: 'event-1', occurredAt: '2026-01-01T00:00:00.000Z' },
    );

    await expect(projection.published(event)).resolves.toBeUndefined();
  });

  // TODO(domain): replace each entry below by a test that publishes events through the test application, with the fake of the read model bound to its port, and asserts the line that is kept.
  it.todo('keeps the same line when the same event is delivered twice');
  it.todo('keeps the newest line when an older event is delivered late');
});
