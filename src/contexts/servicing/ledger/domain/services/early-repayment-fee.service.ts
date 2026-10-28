import { Money } from '@/shared-kernel/money.vo';

/** The fee is 1 percent of the capital repaid while more than a year of the schedule remains, 0.5 percent otherwise. */
const FEE_ABOVE_ONE_YEAR_BASIS_POINTS = 100n;
const FEE_WITHIN_ONE_YEAR_BASIS_POINTS = 50n;
const MONTHS_IN_A_YEAR = 12;
const BASIS_POINTS_IN_ONE = 10000n;

/** The early repayment fee: in whole cents, rounded down, so no float is held. */
export class EarlyRepaymentFeeService {
  /** The fee charged on `capital` repaid when `monthsRemaining` months of the schedule are still to run. */
  of(capital: Money, monthsRemaining: number): Money {
    const rate =
      monthsRemaining > MONTHS_IN_A_YEAR ? FEE_ABOVE_ONE_YEAR_BASIS_POINTS : FEE_WITHIN_ONE_YEAR_BASIS_POINTS;

    return Money.ofCents(Number((BigInt(capital.cents) * rate) / BASIS_POINTS_IN_ONE));
  }
}
