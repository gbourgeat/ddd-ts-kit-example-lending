import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { UnknownLegalMaximumRate } from '@/contexts/credit-application/offer/domain/errors/unknown-legal-maximum-rate.error';

describe('UnknownLegalMaximumRate', () => {
  it('refuses for unknown legal maximum rate with the code UNKNOWN_LEGAL_MAXIMUM_RATE', () => {
    const error = UnknownLegalMaximumRate.forUnknownLegalMaximumRate();

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('UNKNOWN_LEGAL_MAXIMUM_RATE');
    expect(error.message).toBe('Unknown legal maximum rate.');
    expect(error.facts).toEqual({});
  });
});
