/** The loan on a past date, in whole cents and numbers, never its personal data. */
export interface GetLoanStatementResult {
  readonly loanId: string;
  readonly asOf: string;
  readonly outstandingCapitalCents: number;
  readonly arrearsCents: number;
  readonly daysPastDue: number;
  /** The amounts of the schedule in force on the date, in whole cents, in order. */
  readonly instalmentsCents: readonly number[];
  readonly instalmentsDue: readonly number[];
  readonly instalmentsPaid: readonly number[];
  readonly instalmentsUnpaid: readonly number[];
}
