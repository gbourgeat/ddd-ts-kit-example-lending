import { describe, expect, it } from '@jest/globals';
import { expectRefusal } from '@ddd-ts-kit/testing';
import { LegalMaximumRateTerms } from '@/contexts/credit-policy/domain/value-objects/legal-maximum-rate-terms.vo';

const effectiveFrom = new Date('2026-07-01T00:00:00.000Z');

describe('LegalMaximumRateTerms', () => {
  it('holds the category, the rate in basis points and the day of effect it was created with', () => {
    const terms = LegalMaximumRateTerms.create({ category: 'term', rateBasisPoints: 1200, effectiveFrom });

    expect(terms.category).toBe('term');
    expect(terms.rateBasisPoints).toBe(1200);
    expect(terms.effectiveFrom).toEqual(effectiveFrom);
  });

  it('is equal to other terms with the same category, rate and day of effect', () => {
    const first = LegalMaximumRateTerms.create({ category: 'car', rateBasisPoints: 1450, effectiveFrom });
    const second = LegalMaximumRateTerms.create({ category: 'car', rateBasisPoints: 1450, effectiveFrom });

    expect(first.equals(second)).toBe(true);
  });

  it('refuses a category other than personal, car or term with the code INVALID_LEGAL_MAXIMUM_RATE', () => {
    expectRefusal(
      () => LegalMaximumRateTerms.create({ category: 'mortgage', rateBasisPoints: 1450, effectiveFrom }),
      'INVALID_LEGAL_MAXIMUM_RATE',
    );
  });

  it('refuses a rate that is not a whole number of basis points with the code INVALID_LEGAL_MAXIMUM_RATE', () => {
    expectRefusal(
      () => LegalMaximumRateTerms.create({ category: 'car', rateBasisPoints: 14.5, effectiveFrom }),
      'INVALID_LEGAL_MAXIMUM_RATE',
    );
  });

  it('refuses a negative rate with the code INVALID_LEGAL_MAXIMUM_RATE', () => {
    expectRefusal(
      () => LegalMaximumRateTerms.create({ category: 'car', rateBasisPoints: -1, effectiveFrom }),
      'INVALID_LEGAL_MAXIMUM_RATE',
    );
  });
});
