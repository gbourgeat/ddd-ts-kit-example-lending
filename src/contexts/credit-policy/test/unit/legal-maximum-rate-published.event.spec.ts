import { describe, expect, it } from '@jest/globals';
import { LegalMaximumRatePublished } from '@/contexts/credit-policy/domain/events/legal-maximum-rate-published.event';

describe('LegalMaximumRatePublished', () => {
  it('is named after the context, the aggregate and the fact', () => {
    const event = new LegalMaximumRatePublished('legal-maximum-rate-1', new Date('2026-01-01T00:00:00.000Z'), {
      category: 'car-loan',
      rateBasisPoints: 2400,
      effectiveFrom: new Date('2026-04-01T00:00:00.000Z'),
    });

    expect(event.name).toBe('credit-policy.legal-maximum-rate.published');
    expect(event.aggregateId).toBe('legal-maximum-rate-1');
  });

  it('carries the category, its rate in basis points and the day it takes effect', () => {
    const event = new LegalMaximumRatePublished('legal-maximum-rate-1', new Date('2026-01-01T00:00:00.000Z'), {
      category: 'car-loan',
      rateBasisPoints: 2400,
      effectiveFrom: new Date('2026-04-01T00:00:00.000Z'),
    });

    expect(event.publication).toEqual({
      category: 'car-loan',
      rateBasisPoints: 2400,
      effectiveFrom: new Date('2026-04-01T00:00:00.000Z'),
    });
  });
});
