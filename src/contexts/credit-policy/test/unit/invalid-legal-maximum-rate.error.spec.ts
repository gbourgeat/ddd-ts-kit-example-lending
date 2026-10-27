import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { InvalidLegalMaximumRate } from '@/contexts/credit-policy/domain/errors/invalid-legal-maximum-rate.error';

describe('InvalidLegalMaximumRate', () => {
  it('refuses a rate that is not a whole number of basis points and exposes it', () => {
    const error = InvalidLegalMaximumRate.forBasisPoints(12.5);

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('INVALID_LEGAL_MAXIMUM_RATE');
    expect(error.facts).toEqual({ basisPoints: 12.5 });
  });

  it('refuses a category other than personal, car or term and exposes it', () => {
    const error = InvalidLegalMaximumRate.forCategory('mortgage');

    expect(error.code).toBe('INVALID_LEGAL_MAXIMUM_RATE');
    expect(error.facts).toEqual({ category: 'mortgage' });
  });

  it('refuses a rate that takes effect before the latest of its category and exposes both dates', () => {
    const effectiveFrom = new Date('2026-01-01T00:00:00.000Z');
    const latestEffectiveFrom = new Date('2026-04-01T00:00:00.000Z');

    const error = InvalidLegalMaximumRate.forBeforeLatest(effectiveFrom, latestEffectiveFrom);

    expect(error.code).toBe('INVALID_LEGAL_MAXIMUM_RATE');
    expect(error.facts).toEqual({ effectiveFrom, latestEffectiveFrom });
  });
});
