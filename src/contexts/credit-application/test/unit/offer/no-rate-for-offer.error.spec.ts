import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { NoRateForOffer } from '@/contexts/credit-application/offer/domain/errors/no-rate-for-offer.error';

describe('NoRateForOffer', () => {
  it('refuses for product and duration with the code NO_RATE_FOR_OFFER, naming both', () => {
    const error = NoRateForOffer.forProductAndDuration('personal-loan', 120);

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('NO_RATE_FOR_OFFER');
    expect(error.facts).toEqual({ productId: 'personal-loan', durationMonths: 120 });
  });
});
