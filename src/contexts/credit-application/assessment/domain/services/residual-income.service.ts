import { Money } from '@/shared-kernel/money.vo';

/** The residual income of a household: what it keeps each month after its repayments and fixed charges. */
export class ResidualIncomeService {
  /** Answers the residual income in whole cents; it is negative when the repayments and charges exceed the income. */
  of(netIncome: Money, repayments: Money, fixedCharges: Money): Money {
    return Money.ofCents(netIncome.cents - repayments.cents - fixedCharges.cents);
  }
}
