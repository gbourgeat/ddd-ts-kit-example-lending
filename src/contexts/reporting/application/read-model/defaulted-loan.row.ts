/** One line of the defaulted-loans read model: a loan servicing declared in default, and when. */
export interface DefaultedLoanRow {
  /** The tenant and the loan, joined: unique across tenants. */
  readonly key: string;
  readonly tenantId: string;
  /** The loan, which is the application it was paid out for. */
  readonly loanId: string;
  /** The instant servicing declared the default. */
  readonly defaultedAt: Date;
}
