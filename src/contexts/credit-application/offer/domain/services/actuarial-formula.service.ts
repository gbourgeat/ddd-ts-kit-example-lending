import { Money } from '@/shared-kernel/money.vo';
import { AnnualPercentageRate } from '@/contexts/credit-application/offer/domain/value-objects/annual-percentage-rate.vo';

/** The nominal rate is a decimal stated to 0.1 per cent: 0.039 is 3.9 per cent. */
export type LoanTerms = {
  readonly amount: Money;
  readonly months: number;
  readonly nominalRate: number;
};

/** A span of whole months and days: 1 month and 3 days is 1 / 12 + 3 / 365 years (remark (c) of Annex I). */
export type Interval = {
  readonly months: number;
  readonly days: number;
};

/**
 * The repayments of a credit. The monthly fee (insurance) joins the repayment stream of the annual percentage rate,
 * not the instalment. The instalments fall at the first interval after the drawdown, then every month.
 */
export type RepaymentPlan = {
  readonly netCredit: Money;
  readonly instalment: Money;
  readonly monthlyFee: Money;
  readonly months: number;
  readonly firstInstalmentAfter: Interval;
};

const BISECTION_STEPS = 100;
const HIGHEST_RATE = 1;
const MONTHS_PER_YEAR = 12;
const DAYS_PER_YEAR = 365;
const TENTHS_PER_UNIT_RATE = 1000;
const HALF = 0.5;

/**
 * The actuarial formula of Annex I of the Consumer Credit Directive: the instalment at the nominal rate, and the
 * annual percentage rate X that equates the credit net of charges with the discounted repayments. Stateless.
 */
export class ActuarialFormulaService {
  /** The constant instalment at the nominal rate (monthly rate: nominal / 12), rounded to the cent. */
  instalmentOf(terms: LoanTerms): Money {
    const { amount, months, nominalRate } = terms;

    if (nominalRate === 0) {
      return Money.ofCents(Math.round(amount.cents / months));
    }

    const monthlyRate = nominalRate / MONTHS_PER_YEAR;
    const payment = (amount.cents * monthlyRate) / (1 - (1 + monthlyRate) ** -months);

    return Money.ofCents(Math.round(payment));
  }

  /**
   * The annual rate X, as a decimal (0.06434412 is 6.434412 per cent), where the net credit equals the repayments
   * discounted at X, the k-th repayment falling at the first interval plus (k - 1) / 12 years.
   */
  annualRateOf(plan: RepaymentPlan): number {
    const repayment = plan.instalment.cents + plan.monthlyFee.cents;
    let low = 0;
    let high = HIGHEST_RATE;

    for (let step = 0; step < BISECTION_STEPS; step++) {
      const middle = (low + high) * HALF;

      if (this.presentValue(plan, repayment, middle) > plan.netCredit.cents) {
        low = middle;
      } else {
        high = middle;
      }
    }

    return (low + high) * HALF;
  }

  /** The annual percentage rate, stated to one decimal of a per cent as the offer states it. */
  annualPercentageRateOf(plan: RepaymentPlan): AnnualPercentageRate {
    return AnnualPercentageRate.ofTenths(Math.round(this.annualRateOf(plan) * TENTHS_PER_UNIT_RATE));
  }

  private presentValue(plan: RepaymentPlan, repayment: number, annualRate: number): number {
    const { firstInstalmentAfter } = plan;
    const firstYears = firstInstalmentAfter.months / MONTHS_PER_YEAR + firstInstalmentAfter.days / DAYS_PER_YEAR;
    let total = 0;

    for (let instalment = 0; instalment < plan.months; instalment++) {
      const years = firstYears + instalment / MONTHS_PER_YEAR;

      total += repayment * (1 + annualRate) ** -years;
    }

    return total;
  }
}
