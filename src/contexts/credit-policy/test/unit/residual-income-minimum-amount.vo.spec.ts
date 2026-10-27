import { describe, expect, it } from '@jest/globals';
import { expectRefusal } from '@ddd-ts-kit/testing';
import { ResidualIncomeMinimumAmount } from '@/contexts/credit-policy/domain/value-objects/residual-income-minimum-amount.vo';

describe('ResidualIncomeMinimumAmount', () => {
  it('keeps a positive whole amount of cents', () => {
    const amount = ResidualIncomeMinimumAmount.create(80_000);

    expect(amount.cents).toBe(80_000);
  });

  it('is equal to another residual income minimum amount of the same cents', () => {
    expect(ResidualIncomeMinimumAmount.create(30_000).equals(ResidualIncomeMinimumAmount.create(30_000))).toBe(true);
  });

  it('refuses a zero amount with the code INVALID_RESIDUAL_INCOME_MINIMUM', () => {
    expectRefusal(() => ResidualIncomeMinimumAmount.create(0), 'INVALID_RESIDUAL_INCOME_MINIMUM');
  });

  it('refuses a negative amount with the code INVALID_RESIDUAL_INCOME_MINIMUM', () => {
    expectRefusal(() => ResidualIncomeMinimumAmount.create(-1), 'INVALID_RESIDUAL_INCOME_MINIMUM');
  });

  it('refuses an amount that is not a whole number of cents with the code INVALID_RESIDUAL_INCOME_MINIMUM', () => {
    expectRefusal(() => ResidualIncomeMinimumAmount.create(300.5), 'INVALID_RESIDUAL_INCOME_MINIMUM');
  });
});
