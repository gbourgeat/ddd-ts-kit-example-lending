import { IsInt, IsString } from 'class-validator';

/** The loan on a past date, as its borrower reads it: its balance, its arrears and its schedule, no personal data. */
export class GetLoanStatementAnswer {
  @IsString()
  loanId = '';

  /** The date of the statement, as an ISO instant. */
  @IsString()
  asOf = '';

  /** The capital still owed on the date, in cents. */
  @IsInt()
  outstandingCapitalCents = 0;

  /** The unpaid instalments past their due date on the date, in cents. */
  @IsInt()
  arrearsCents = 0;

  /** The days since the oldest unpaid instalment fell due; zero when nothing is unpaid. */
  @IsInt()
  daysPastDue = 0;

  /** The constant monthly instalments of the schedule in force on the date, in cents, in order. */
  @IsInt({ each: true })
  instalmentsCents: number[] = [];

  /** The numbers, counted from one, of the instalments due on the date. */
  @IsInt({ each: true })
  instalmentsDue: number[] = [];

  /** The numbers, counted from one, of the instalments paid by direct debit on the date. */
  @IsInt({ each: true })
  instalmentsPaid: number[] = [];

  /** The numbers, counted from one, of the instalments unpaid on the date. */
  @IsInt({ each: true })
  instalmentsUnpaid: number[] = [];
}
