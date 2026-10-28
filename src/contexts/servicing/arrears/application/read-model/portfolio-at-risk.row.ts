/** One line of the portfolio-at-risk read model: a loan paid out, the principal of its schedule and the arrears bucket it is in. */
export interface PortfolioAtRiskRow {
  /** The loan, which is its key: the application it was paid out for. */
  readonly loanId: string;
  /** The principal of the schedule, in whole cents. */
  readonly principalCents: number;
  /** The arrears bucket the loan is in: one of the values of `ArrearsBucket`. */
  readonly bucket: string;
  /** Whether the loan is still in the portfolio: paid out and not closed. */
  readonly open: boolean;
}
