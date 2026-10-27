import { InvalidNetIncome } from '@/contexts/credit-application/assessment/domain/errors/invalid-net-income.error';
import type { Money } from '@/shared-kernel/money.vo';

/** The debt to income ratio of a household: its monthly repayments, the new one included, over its net monthly income. */
export class DebtToIncomeRatioService {
  /** Answers the ratio as a fraction: 0.35 is 35 percent. The caller sums the repayments, the new one included. */
  ratioOf(repayments: Money, netIncome: Money): number {
    if (netIncome.cents <= 0) {
      throw InvalidNetIncome.forCents(netIncome.cents);
    }

    return repayments.cents / netIncome.cents;
  }
}
