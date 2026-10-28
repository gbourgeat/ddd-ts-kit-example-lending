import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { OfferNotSigned } from '@/contexts/credit-application/offer/domain/errors/offer-not-signed.error';

describe('OfferNotSigned', () => {
  it('refuses an application with no signed offer with the code OFFER_NOT_SIGNED', () => {
    const error = OfferNotSigned.forNotSigned('application-1');

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('OFFER_NOT_SIGNED');
  });
});
