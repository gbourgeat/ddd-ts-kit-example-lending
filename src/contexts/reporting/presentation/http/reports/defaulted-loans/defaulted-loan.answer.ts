import { IsInt, IsISO8601, IsString } from 'class-validator';

/** A loan in default: its branch, the amount paid out to it and the instant of its default. */
export class DefaultedLoanAnswer {
  @IsString()
  loanId = '';

  @IsString()
  branchId = '';

  /** The amount paid out to the loan, in cents. */
  @IsInt()
  principalCents = 0;

  /** The instant servicing declared the default, as an ISO 8601 instant. */
  @IsISO8601()
  defaultedAt = '';
}
