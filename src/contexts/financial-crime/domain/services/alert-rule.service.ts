/** Above this total of early repayments within a year of the payout, in cents, an alert is raised. */
const EARLY_REPAYMENT_THRESHOLD_CENTS = 1_000_000;

/** The facts of a repayment the alert rules read, as a plain record: what was paid, when, from which account, and what was already repaid early. */
interface Facts {
  readonly amountCents: number;
  readonly early: boolean;
  readonly paidAt: Date;
  readonly payoutAt: Date;
  readonly earlyRepaidWithinYearCents: number;
  readonly payerAccount: string;
  readonly borrowerAccounts: readonly string[];
}

/** Decides whether a repayment raises an alert, from its facts alone. */
export class AlertRuleService {
  evaluate(facts: Facts): {
    readonly raised: boolean;
    readonly reason?: 'early-repayment-above-threshold' | 'payment-from-another-account';
  } {
    if (this.isEarlyRepaymentAboveThreshold(facts)) {
      return { raised: true, reason: 'early-repayment-above-threshold' };
    }

    if (this.isFromAnotherAccount(facts)) {
      return { raised: true, reason: 'payment-from-another-account' };
    }

    return { raised: false };
  }

  private isEarlyRepaymentAboveThreshold(facts: Facts): boolean {
    if (!facts.early || !this.isWithinYearOfPayout(facts)) {
      return false;
    }

    return facts.earlyRepaidWithinYearCents + facts.amountCents > EARLY_REPAYMENT_THRESHOLD_CENTS;
  }

  private isWithinYearOfPayout(facts: Facts): boolean {
    const yearEnd = new Date(facts.payoutAt);

    yearEnd.setUTCFullYear(yearEnd.getUTCFullYear() + 1);

    return facts.paidAt.getTime() >= facts.payoutAt.getTime() && facts.paidAt.getTime() <= yearEnd.getTime();
  }

  private isFromAnotherAccount(facts: Facts): boolean {
    return !facts.borrowerAccounts.includes(facts.payerAccount);
  }
}
