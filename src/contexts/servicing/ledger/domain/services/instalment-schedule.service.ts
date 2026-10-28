import { InvalidSchedule } from '@/contexts/servicing/ledger/domain/errors/invalid-schedule.error';
import { Money } from '@/shared-kernel/money.vo';

// The nominal rate is a whole number of basis points: one basis point is 0.01 percent, so 5.0 percent is 500.
// Its monthly rate is that number over 10,000 times 12, so every computation below is exact integer arithmetic.
const MONTHLY_RATE_DIVISOR = 120000n;
const ZERO = 0n;
const ONE = 1n;
const HALF = 2n;

type CheckedTerms = { principal: bigint; rate: bigint; months: bigint };

/**
 * The schedule of a loan: constant monthly instalments in whole cents, rounded half up.
 * The instalment is the annuity of the amount at the nominal rate; the monthly fee is not part of it.
 * Each month's interest is rounded to the cent; the last instalment absorbs the rounding difference,
 * so the balance is cleared exactly at the last month.
 */
export class InstalmentScheduleService {
  /** The constant monthly instalment, in cents, of the amount at the nominal rate over the months. */
  instalment(terms: { principal: Money; annualRateBasisPoints: number; months: number }): Money {
    return Money.ofCents(Number(this.constantCents(this.check(terms))));
  }

  /** The amounts of the instalments in order: each is the constant instalment, the last clears the balance. */
  schedule(terms: { principal: Money; annualRateBasisPoints: number; months: number }): Money[] {
    const checked = this.check(terms);
    const instalment = this.constantCents(checked);
    const amounts: Money[] = [];
    let balance = checked.principal;

    for (let month = ONE; month < checked.months; month += ONE) {
      const interest = this.interestCents(balance, checked.rate);

      amounts.push(Money.ofCents(Number(instalment)));
      balance -= instalment - interest;
    }

    const lastInterest = this.interestCents(balance, checked.rate);

    amounts.push(Money.ofCents(Number(balance + lastInterest)));

    return amounts;
  }

  /** The capital still owed once the first `paid` instalments are paid: each repays its amount less the interest of the balance it is paid on. */
  balanceAfter(
    terms: { principal: Money; annualRateBasisPoints: number; instalments: readonly Money[] },
    paid: number,
  ): Money {
    const rate = BigInt(terms.annualRateBasisPoints);
    let balance = BigInt(terms.principal.cents);

    for (const instalment of terms.instalments.slice(0, paid)) {
      balance -= BigInt(instalment.cents) - this.interestCents(balance, rate);
    }

    return Money.ofCents(Number(balance));
  }

  private constantCents(terms: CheckedTerms): bigint {
    if (terms.rate === ZERO) {
      return this.roundHalfUp(terms.principal, terms.months);
    }

    const growth = (MONTHLY_RATE_DIVISOR + terms.rate) ** terms.months;
    const decay = MONTHLY_RATE_DIVISOR ** terms.months;
    const numerator = terms.principal * terms.rate * growth;
    const denominator = MONTHLY_RATE_DIVISOR * (growth - decay);

    return this.roundHalfUp(numerator, denominator);
  }

  private interestCents(balance: bigint, rate: bigint): bigint {
    return this.roundHalfUp(balance * rate, MONTHLY_RATE_DIVISOR);
  }

  private roundHalfUp(numerator: bigint, denominator: bigint): bigint {
    return (HALF * numerator + denominator) / (HALF * denominator);
  }

  private check(terms: { principal: Money; annualRateBasisPoints: number; months: number }): CheckedTerms {
    if (terms.principal.cents <= 0) {
      throw InvalidSchedule.forInvalidTerms('the amount is above zero', terms.principal.cents);
    }

    if (!Number.isSafeInteger(terms.annualRateBasisPoints) || terms.annualRateBasisPoints < 0) {
      throw InvalidSchedule.forInvalidTerms(
        'the rate is a whole number of basis points, not negative',
        terms.annualRateBasisPoints,
      );
    }

    if (!Number.isSafeInteger(terms.months) || terms.months < 1) {
      throw InvalidSchedule.forInvalidTerms('the number of months is a whole number, at least one', terms.months);
    }

    return {
      principal: BigInt(terms.principal.cents),
      rate: BigInt(terms.annualRateBasisPoints),
      months: BigInt(terms.months),
    };
  }
}
