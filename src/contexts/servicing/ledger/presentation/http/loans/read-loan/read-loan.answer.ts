import { ArrearsBucket } from '@/contexts/servicing/arrears/domain/vocabularies/arrears-bucket.vocabulary';
import { IsBoolean, IsInt, IsString } from 'class-validator';

/** The loan as its borrower reads it: no personal data is part of it. */
export class ReadLoanAnswer {
  @IsString()
  loanId = '';

  /** Paid out until its schedule ends or it is closed. */
  @IsString()
  status: 'paid-out' | 'closed' = 'paid-out';

  /** The amount paid out, in cents. */
  @IsInt()
  principalCents = 0;

  /** The annual rate of the loan, in basis points. */
  @IsInt()
  annualRateBasisPoints = 0;

  /** The duration of the loan, in whole months. */
  @IsInt()
  durationMonths = 1;

  /** The constant monthly instalments, in cents, in order. */
  @IsInt({ each: true })
  instalmentsCents: number[] = [];

  /** The numbers, counted from one, of the instalments due by the last nightly computation. */
  @IsInt({ each: true })
  instalmentsDue: number[] = [];

  /** The numbers, counted from one, of the instalments paid by direct debit. */
  @IsInt({ each: true })
  instalmentsPaid: number[] = [];

  /** The numbers, counted from one, of the instalments whose direct debit was rejected: unpaid. */
  @IsInt({ each: true })
  instalmentsUnpaid: number[] = [];

  /** The arrears bucket of the last classification: none, or one of the buckets of the arrears. */
  @IsString()
  arrearsBucket: ArrearsBucket = ArrearsBucket.None;

  /** Declared in default, 90 days past due, and handed to collections. */
  @IsBoolean()
  defaulted = false;
}
