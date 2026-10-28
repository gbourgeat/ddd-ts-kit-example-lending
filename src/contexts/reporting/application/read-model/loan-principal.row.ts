/** One line of the loan-principal read model: a loan, the branch it was paid out on and the amount paid out. */
export interface LoanPrincipalRow {
  /** The tenant and the loan, joined: unique across tenants. */
  readonly key: string;
  readonly tenantId: string;
  readonly loanId: string;
  readonly branchId: string;
  /** The amount paid out to the loan, in cents. */
  readonly principalCents: number;
}
