import { Money } from '@/shared-kernel/money.vo';

const BASIS_POINTS_PER_WHOLE = 10_000;
const DAYS_PER_YEAR = 365;
const MILLISECONDS_PER_DAY = 86_400_000;
const NO_DAY = 0;

/**
 * The interest accrued on an amount at a simple annual rate, day by day: principal times the rate, times the whole
 * days elapsed, over 365 days. The result is in whole cents, rounded down.
 */
export class SimpleDailyInterestService {
  /** The interest on `principal` at `annualRateBasisPoints` from `from` to `to`; nothing accrues back in time. */
  of(principal: Money, annualRateBasisPoints: number, from: Date, to: Date): Money {
    const days = Math.max(NO_DAY, Math.floor((to.getTime() - from.getTime()) / MILLISECONDS_PER_DAY));

    const cents = Math.floor(
      (principal.cents * annualRateBasisPoints * days) / (BASIS_POINTS_PER_WHOLE * DAYS_PER_YEAR),
    );

    return Money.ofCents(cents);
  }
}
