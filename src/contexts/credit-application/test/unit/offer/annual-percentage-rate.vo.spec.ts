import { describe, expect, it } from '@jest/globals';
import { expectRefusal } from '@ddd-ts-kit/testing';
import { AnnualPercentageRate } from '@/contexts/credit-application/offer/domain/value-objects/annual-percentage-rate.vo';

describe('AnnualPercentageRate', () => {
  it('is equal to another rate of the same tenths', () => {
    expect(AnnualPercentageRate.ofTenths(51).equals(AnnualPercentageRate.ofTenths(51))).toBe(true);
  });

  it('states its value to one decimal, as the offer does', () => {
    expect(AnnualPercentageRate.ofTenths(51).percent).toBe('5.1');
    expect(AnnualPercentageRate.ofTenths(104).percent).toBe('10.4');
    expect(AnnualPercentageRate.ofTenths(0).percent).toBe('0.0');
  });

  it('refuses a negative rate with its code', () => {
    expectRefusal(() => AnnualPercentageRate.ofTenths(-1), 'INVALID_ANNUAL_PERCENTAGE_RATE');
  });

  it('refuses a fraction of a tenth with its code', () => {
    expectRefusal(() => AnnualPercentageRate.ofTenths(5.1), 'INVALID_ANNUAL_PERCENTAGE_RATE');
  });
});
