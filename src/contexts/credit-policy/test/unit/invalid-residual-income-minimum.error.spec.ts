import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { InvalidResidualIncomeMinimum } from '@/contexts/credit-policy/domain/errors/invalid-residual-income-minimum.error';

describe('InvalidResidualIncomeMinimum', () => {
  it('refuses a zero minimum with the code INVALID_RESIDUAL_INCOME_MINIMUM and exposes its cents', () => {
    const error = InvalidResidualIncomeMinimum.forCents(0);

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('INVALID_RESIDUAL_INCOME_MINIMUM');
    expect(error.facts).toEqual({ cents: 0 });
  });
});
