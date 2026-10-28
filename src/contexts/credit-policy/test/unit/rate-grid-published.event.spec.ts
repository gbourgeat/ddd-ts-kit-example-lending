import { describe, expect, it } from '@jest/globals';
import { RateGridPublished } from '@/contexts/credit-policy/domain/events/rate-grid-published.event';

describe('RateGridPublished', () => {
  it('is named after the context, the aggregate and the fact', () => {
    const event = new RateGridPublished('rate-grid-1', new Date('2026-01-01T00:00:00.000Z'), {
      productId: 'personal-loan',
      effectiveFrom: new Date('2026-03-01T00:00:00.000Z'),
    });

    expect(event.name).toBe('credit-policy.rate-grid.published');
    expect(event.aggregateId).toBe('rate-grid-1');
  });

  it('carries the product and the day the grid takes effect', () => {
    const event = new RateGridPublished('rate-grid-1', new Date('2026-01-01T00:00:00.000Z'), {
      productId: 'personal-loan',
      effectiveFrom: new Date('2026-03-01T00:00:00.000Z'),
    });

    expect(event.publication.productId).toBe('personal-loan');
    expect(event.publication.effectiveFrom).toEqual(new Date('2026-03-01T00:00:00.000Z'));
  });
});
