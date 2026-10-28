import type { Borrower } from '@/contexts/servicing/ledger/domain/value-objects/borrower.vo';
import type { LoanSchedule } from '@/contexts/servicing/ledger/domain/value-objects/loan-schedule.vo';
import type { Rescheduling } from '@/contexts/servicing/ledger/domain/values/rescheduling';
import type { Money } from '@/shared-kernel/money.vo';

export interface LoanState {
  readonly registeredAt: Date;
  readonly closedAt: Date | undefined;
  readonly borrower: Borrower | undefined;
  /** The schedule of the payout: its principal is the amount paid out, its rate is kept by the loan. */
  readonly schedule: LoanSchedule | undefined;
  /** The schedule in force once the loan has been rescheduled; undefined while the schedule of the payout is in force. */
  readonly rescheduling: Rescheduling | undefined;
  /** The decisions, by their event id, whose rescheduling the loan already recorded: a delivery seen again records nothing. */
  readonly rescheduledBy: readonly string[];
  /** The numbers, counted from one, of the instalments already recorded as due. */
  readonly instalmentsDue: readonly number[];
  /** The capital repaid early, over the life of the loan. */
  readonly earlyRepaid: Money;
  /** The outstanding capital written off, while the write-off stands; undefined once reversed or never written off. */
  readonly writtenOff: Money | undefined;
  /** The numbers of the instalments whose direct debit was accepted: their money is received. */
  readonly instalmentsPaid: readonly number[];
  /** The numbers of the instalments whose direct debit was rejected: unpaid, and not retried. */
  readonly instalmentsUnpaid: readonly number[];
}
