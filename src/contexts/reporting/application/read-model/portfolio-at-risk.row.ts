/** One line of the portfolio-at-risk read model: a loan, and the arrears bucket it is in as servicing last announced it. */
export interface PortfolioAtRiskRow {
  /** The tenant and the loan, joined: unique across tenants. */
  readonly key: string;
  readonly tenantId: string;
  /** The loan, which is the application it was paid out for. */
  readonly loanId: string;
  /** One of `OneToThirtyDays`, `ThirtyOneToSixtyDays`, `SixtyOneToNinetyDays` or `OverNinetyDays`. */
  readonly bucket: string;
}
