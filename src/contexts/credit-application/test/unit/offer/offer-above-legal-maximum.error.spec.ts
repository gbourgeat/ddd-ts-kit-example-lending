import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { OfferAboveLegalMaximum } from '@/contexts/credit-application/offer/domain/errors/offer-above-legal-maximum.error';

describe('OfferAboveLegalMaximum', () => {
  it('refuses with the code OFFER_ABOVE_LEGAL_MAXIMUM, naming the rate and the maximum in force', () => {
    const error = OfferAboveLegalMaximum.forAboveLegalMaximum(126, 1_250);

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('OFFER_ABOVE_LEGAL_MAXIMUM');
    expect(error.facts).toEqual({ annualPercentageRateTenths: 126, legalMaximumBasisPoints: 1_250 });
  });
});
