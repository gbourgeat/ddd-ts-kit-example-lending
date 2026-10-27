import { describe, expect, it } from '@jest/globals';
import { expectRefusal } from '@ddd-ts-kit/testing';
import { DebtToIncomeRatioService } from '@/contexts/credit-application/assessment/domain/services/debt-to-income-ratio.service';
import { Money } from '@/shared-kernel/money.vo';

describe('DebtToIncomeRatioService', () => {
  it('holds no state of its own', () => {
    expect(Object.keys(new DebtToIncomeRatioService())).toEqual([]);
  });

  it('divides the monthly repayments by the net monthly income, as a fraction', () => {
    const service = new DebtToIncomeRatioService();

    expect(service.ratioOf(Money.ofCents(35_000), Money.ofCents(100_000))).toBe(0.35);
  });

  it('gives a ratio above one when the repayments exceed the income', () => {
    const service = new DebtToIncomeRatioService();

    expect(service.ratioOf(Money.ofCents(150_000), Money.ofCents(100_000))).toBe(1.5);
  });

  it('gives no ratio at all when the net income is zero', () => {
    const service = new DebtToIncomeRatioService();

    expectRefusal(() => service.ratioOf(Money.ofCents(35_000), Money.ofCents(0)), 'INVALID_NET_INCOME');
  });

  it('gives no ratio at all when the net income is negative', () => {
    const service = new DebtToIncomeRatioService();

    expectRefusal(() => service.ratioOf(Money.ofCents(35_000), Money.ofCents(-1)), 'INVALID_NET_INCOME');
  });
});
