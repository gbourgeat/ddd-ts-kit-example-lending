import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { OfferAlreadyAccepted } from '@/contexts/credit-application/offer/domain/errors/offer-already-accepted.error';

describe('OfferAlreadyAccepted', () => {
  it('refuses a second signature of the offer, by the code OFFER_ALREADY_ACCEPTED', () => {
    const error = OfferAlreadyAccepted.forAlreadyAccepted('offer-1');

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('OFFER_ALREADY_ACCEPTED');
    expect(error.facts).toEqual({ offerId: 'offer-1' });
  });
});
