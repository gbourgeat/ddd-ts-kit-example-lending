import { describe, expect, it } from '@jest/globals';
import { ResidualIncomeService } from '@/contexts/credit-application/assessment/domain/services/residual-income.service';
import { Money } from '@/shared-kernel/money.vo';

describe('ResidualIncomeService', () => {
  it('holds no state of its own', () => {
    expect(Object.keys(new ResidualIncomeService())).toEqual([]);
  });

  it('keeps what the household has each month after its repayments and fixed charges, in whole cents', () => {
    const service = new ResidualIncomeService();

    const residual = service.of(Money.ofCents(300_000), Money.ofCents(80_000), Money.ofCents(50_000));

    expect(residual.cents).toBe(170_000);
  });

  it('is negative when the repayments and fixed charges exceed the net income', () => {
    const service = new ResidualIncomeService();

    const residual = service.of(Money.ofCents(100_000), Money.ofCents(80_000), Money.ofCents(50_000));

    expect(residual.cents).toBe(-30_000);
  });

  it('is the net income itself when nothing is repaid and no charge is fixed', () => {
    const service = new ResidualIncomeService();

    const residual = service.of(Money.ofCents(250_000), Money.ofCents(0), Money.ofCents(0));

    expect(residual.cents).toBe(250_000);
  });
});
