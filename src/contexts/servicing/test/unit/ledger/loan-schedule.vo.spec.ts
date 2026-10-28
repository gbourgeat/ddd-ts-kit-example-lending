import { describe, expect, it } from '@jest/globals';
import { LoanSchedule } from '@/contexts/servicing/ledger/domain/value-objects/loan-schedule.vo';
import { Money } from '@/shared-kernel/money.vo';

const ONE_HUNDRED_EUROS_IN_CENTS = 10_000;
const TWELVE_MONTHS = 12;

describe('LoanSchedule', () => {
  it('holds one instalment per month of its duration', () => {
    const schedule = LoanSchedule.of(Money.ofCents(ONE_HUNDRED_EUROS_IN_CENTS), 0, TWELVE_MONTHS);

    expect(schedule.instalments).toHaveLength(TWELVE_MONTHS);
  });

  it('splits an interest-free amount into equal monthly instalments that repay it in full', () => {
    const schedule = LoanSchedule.of(Money.ofCents(ONE_HUNDRED_EUROS_IN_CENTS), 0, 4);

    expect(schedule.instalments.map((instalment) => instalment.cents)).toEqual([2_500, 2_500, 2_500, 2_500]);
  });

  it('keeps the amount, the rate and the duration it was computed from', () => {
    const schedule = LoanSchedule.of(Money.ofCents(ONE_HUNDRED_EUROS_IN_CENTS), 500, TWELVE_MONTHS);

    expect(schedule.principal.cents).toBe(ONE_HUNDRED_EUROS_IN_CENTS);
    expect(schedule.annualRateBasisPoints).toBe(500);
    expect(schedule.durationMonths).toBe(TWELVE_MONTHS);
  });

  it('is equal to a schedule recorded with the same instalments', () => {
    const computed = LoanSchedule.of(Money.ofCents(ONE_HUNDRED_EUROS_IN_CENTS), 0, 4);

    const recorded = LoanSchedule.recorded({
      principal: Money.ofCents(ONE_HUNDRED_EUROS_IN_CENTS),
      annualRateBasisPoints: 0,
      durationMonths: 4,
      instalments: computed.instalments,
    });

    expect(recorded.equals(computed)).toBe(true);
  });
});
