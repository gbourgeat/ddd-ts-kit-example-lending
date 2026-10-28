import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { UnknownOffer } from '@/contexts/credit-application/offer/domain/errors/unknown-offer.error';

describe('UnknownOffer', () => {
  it('refuses for offer with the code UNKNOWN_OFFER, naming the offer', () => {
    const error = UnknownOffer.forOffer('offer-9');

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('UNKNOWN_OFFER');
    expect(error.facts).toEqual({ offerId: 'offer-9' });
  });
});
