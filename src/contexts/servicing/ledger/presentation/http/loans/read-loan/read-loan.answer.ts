import { IsInt, IsString } from 'class-validator';

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
}
