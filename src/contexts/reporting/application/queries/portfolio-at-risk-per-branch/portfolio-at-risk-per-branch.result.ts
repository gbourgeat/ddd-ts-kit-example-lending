/** The portfolio at risk of each branch of the tenant, from the loans paid out on it and the arrears bucket each is in. */
export interface PortfolioAtRiskPerBranchResult {
  /** One line per branch that paid out a loan, sorted by branch. */
  readonly branches: readonly {
    readonly branchId: string;
    /** The total paid out on the branch, in cents: the denominator of the portfolio at risk. */
    readonly paidOutCents: number;
    readonly oneToThirtyDaysCents: number;
    readonly thirtyOneToSixtyDaysCents: number;
    readonly sixtyOneToNinetyDaysCents: number;
    readonly overNinetyDaysCents: number;
    /** The amount 31 days past due and over, in cents. */
    readonly atRiskCents: number;
    /** The share of the paid out amount that is at risk, in basis points, rounded down. */
    readonly portfolioAtRiskBasisPoints: number;
  }[];
}
