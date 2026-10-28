import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { OfferNotIssued } from '@/contexts/credit-application/offer/domain/errors/offer-not-issued.error';

describe('OfferNotIssued', () => {
  it('refuses a signature of an offer not yet issued, by the code OFFER_NOT_ISSUED', () => {
    const error = OfferNotIssued.forNotIssued('offer-1');

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('OFFER_NOT_ISSUED');
    expect(error.facts).toEqual({ offerId: 'offer-1' });
  });
});
