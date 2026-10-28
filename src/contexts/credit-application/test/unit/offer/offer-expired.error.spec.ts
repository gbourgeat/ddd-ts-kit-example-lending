import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { OfferExpired } from '@/contexts/credit-application/offer/domain/errors/offer-expired.error';

describe('OfferExpired', () => {
  it('refuses a signature after the validity of the offer, by the code OFFER_EXPIRED', () => {
    const error = OfferExpired.forExpiry('offer-1', new Date('2026-04-16T00:00:00.000Z'));

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('OFFER_EXPIRED');
  });

  it('carries the expiry of the offer, as the one fact a client reads', () => {
    const error = OfferExpired.forExpiry('offer-1', new Date('2026-04-16T00:00:00.000Z'));

    expect(error.facts).toEqual({ offerId: 'offer-1', expiredAt: '2026-04-16T00:00:00.000Z' });
  });
});
