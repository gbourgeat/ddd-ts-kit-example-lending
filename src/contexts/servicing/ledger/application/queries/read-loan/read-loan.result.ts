/** The loan as its borrower reads it: its status, its amount, its duration and its instalments, never its personal data. */
export interface ReadLoanResult {
  readonly loanId: string;
  readonly status: 'paid-out' | 'closed';
  readonly principalCents: number;
  readonly annualRateBasisPoints: number;
  readonly durationMonths: number;
  readonly instalmentsCents: readonly number[];
  /** The numbers, counted from one, of the instalments the ledger recorded as due. */
  readonly instalmentsDue: readonly number[];
}
