import type { Money } from '@/shared-kernel/money.vo';

/** The loan as it stood on a past date, replayed from its events up to that date: its balance, its arrears and its schedule. */
export interface LoanStatement {
  readonly loanId: string;
  readonly asOf: Date;
  /** The capital still owed on the date: the principal, less the capital repaid early and written off. */
  readonly outstandingCapital: Money;
  /** The sum of the instalments unpaid on the date and not paid since. */
  readonly arrears: Money;
  /** The days since the due date of the oldest unpaid instalment; zero when nothing is unpaid. */
  readonly daysPastDue: number;
  /** The amounts of the schedule in force on the date, in order. */
  readonly instalments: readonly Money[];
  /** The numbers, counted from one, of the instalments noted due on the date. */
  readonly instalmentsDue: readonly number[];
  /** The numbers of the instalments whose direct debit was accepted on the date. */
  readonly instalmentsPaid: readonly number[];
  /** The numbers of the instalments unpaid on the date: their direct debit was rejected. */
  readonly instalmentsUnpaid: readonly number[];
}
