import { describe, expect, it } from '@jest/globals';
import { expectRefusal } from '@ddd-ts-kit/testing';
import { InstalmentScheduleService } from '@/contexts/servicing/ledger/domain/services/instalment-schedule.service';
import { Money } from '@/shared-kernel/money.vo';

// The rate is a whole number of basis points (500 is 5.0 percent). The instalment is the annuity of the
// amount at the nominal rate over the months, rounded half up to the cent; the monthly fee is not part of it.
// The schedule rounds each month's interest half up to the cent, and its last instalment absorbs the
// rounding difference so the balance is cleared exactly. The examples are the APR worked examples.
describe('InstalmentScheduleService', () => {
  const service = new InstalmentScheduleService();

  it('holds no state of its own', () => {
    expect(Object.keys(new InstalmentScheduleService())).toEqual([]);
  });

  it('gives 299.71 a month for 10,000.00 at 5.0 percent over 36 months', () => {
    const instalment = service.instalment({
      principal: Money.ofCents(1000000),
      annualRateBasisPoints: 500,
      months: 36,
    });

    expect(instalment.cents).toBe(29971);
  });

  it('gives 223.64 a month for 5,000.00 at 6.9 percent over 24 months', () => {
    const instalment = service.instalment({
      principal: Money.ofCents(500000),
      annualRateBasisPoints: 690,
      months: 24,
    });

    expect(instalment.cents).toBe(22364);
  });

  it('gives 367.43 a month for 20,000.00 at 3.9 percent over 60 months, without the monthly fee', () => {
    const instalment = service.instalment({
      principal: Money.ofCents(2000000),
      annualRateBasisPoints: 390,
      months: 60,
    });

    expect(instalment.cents).toBe(36743);
  });

  it('divides the amount evenly over the months when the rate is zero', () => {
    const instalment = service.instalment({
      principal: Money.ofCents(150000),
      annualRateBasisPoints: 0,
      months: 12,
    });

    expect(instalment.cents).toBe(12500);
  });

  it('gives as many instalments as months, the first ones constant', () => {
    const amounts = service.schedule({
      principal: Money.ofCents(1000000),
      annualRateBasisPoints: 500,
      months: 36,
    });

    expect(amounts).toHaveLength(36);
    expect(amounts.slice(0, 35).every((amount) => amount.cents === 29971)).toBe(true);
  });

  it('lets the last instalment absorb the rounding difference: 299.69 for the example of 10,000.00', () => {
    const amounts = service.schedule({
      principal: Money.ofCents(1000000),
      annualRateBasisPoints: 500,
      months: 36,
    });

    expect(amounts.at(-1)?.cents).toBe(29969);
  });

  it('sums the instalments to the amount plus the interest, the balance cleared at the last month', () => {
    const amounts = service.schedule({
      principal: Money.ofCents(1000000),
      annualRateBasisPoints: 500,
      months: 36,
    });

    const total = amounts.reduce((sum, amount) => sum + amount.cents, 0);

    expect(total).toBe(1078954);
  });

  it('refuses an amount that is not above zero', () => {
    expectRefusal(
      () => service.instalment({ principal: Money.ofCents(0), annualRateBasisPoints: 500, months: 36 }),
      'INVALID_SCHEDULE',
      { rule: 'the amount is above zero', value: 0 },
    );
  });

  it('refuses a negative rate', () => {
    expectRefusal(
      () => service.instalment({ principal: Money.ofCents(1000000), annualRateBasisPoints: -1, months: 36 }),
      'INVALID_SCHEDULE',
      { rule: 'the rate is a whole number of basis points, not negative', value: -1 },
    );
  });

  it('refuses a number of months below one', () => {
    expectRefusal(
      () => service.schedule({ principal: Money.ofCents(1000000), annualRateBasisPoints: 500, months: 0 }),
      'INVALID_SCHEDULE',
      { rule: 'the number of months is a whole number, at least one', value: 0 },
    );
  });
});
