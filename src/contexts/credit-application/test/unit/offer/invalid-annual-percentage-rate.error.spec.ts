import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { InvalidAnnualPercentageRate } from '@/contexts/credit-application/offer/domain/errors/invalid-annual-percentage-rate.error';

describe('InvalidAnnualPercentageRate', () => {
  it('refuses for value with the code INVALID_ANNUAL_PERCENTAGE_RATE', () => {
    const error = InvalidAnnualPercentageRate.forValue(-1);

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('INVALID_ANNUAL_PERCENTAGE_RATE');
    expect(error.message).toBe('An annual percentage rate is a whole number of tenths of a per cent, not negative.');
    expect(error.facts).toEqual({ tenths: -1 });
  });
});
