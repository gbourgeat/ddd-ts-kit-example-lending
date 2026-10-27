import { Money } from '@/shared-kernel/money.vo';
import { AnnualPercentageRate } from '@/contexts/credit-application/offer/domain/value-objects/annual-percentage-rate.vo';

/** The nominal rate is a decimal stated to 0.1 per cent: 0.039 is 3.9 per cent. */
export type LoanTerms = {
  readonly amount: Money;
  readonly months: number;
  readonly nominalRate: number;
};

export type RepaymentPlan = {
  readonly netCredit: Money;
  readonly instalment: Money;
  readonly monthlyFee: Money;
  readonly months: number;
};

const BISECTION_STEPS = 100;
const HIGHEST_RATE = 1;
const MONTHS_PER_YEAR = 12;
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

  /** The rate X where the net credit equals the repayments of instalment plus monthly fee, at k / 12 years. */
  annualPercentageRateOf(plan: RepaymentPlan): AnnualPercentageRate {
    const repayment = plan.instalment.cents + plan.monthlyFee.cents;
    let low = 0;
    let high = HIGHEST_RATE;

    for (let step = 0; step < BISECTION_STEPS; step++) {
      const middle = (low + high) * HALF;

      if (this.presentValue(repayment, plan.months, middle) > plan.netCredit.cents) {
        low = middle;
      } else {
        high = middle;
      }
    }

    const annualRate = (low + high) * HALF;

    return AnnualPercentageRate.ofTenths(Math.floor(annualRate * TENTHS_PER_UNIT_RATE + HALF));
  }

  private presentValue(repayment: number, months: number, annualRate: number): number {
    let total = 0;

    for (let month = 1; month <= months; month++) {
      total += repayment * (1 + annualRate) ** (-month / MONTHS_PER_YEAR);
    }

    return total;
  }
}
