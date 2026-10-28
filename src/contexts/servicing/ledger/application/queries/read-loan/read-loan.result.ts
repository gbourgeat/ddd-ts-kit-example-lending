import type { ArrearsBucket } from '@/contexts/servicing/arrears/domain/vocabularies/arrears-bucket.vocabulary';

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
  /** The numbers, counted from one, of the instalments whose direct debit was accepted: their money is received. */
  readonly instalmentsPaid: readonly number[];
  /** The numbers, counted from one, of the instalments whose direct debit was rejected: unpaid, and not retried. */
  readonly instalmentsUnpaid: readonly number[];
  /** The arrears bucket of the last classification: none while the loan is not past due. */
  readonly arrearsBucket: ArrearsBucket;
}
