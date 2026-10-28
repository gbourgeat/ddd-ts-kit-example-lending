import type { LoanPaidOut } from '@/contexts/servicing/ledger/domain/events/loan-paid-out.event';
import type { LoanScheduled } from '@/contexts/servicing/ledger/domain/events/loan-scheduled.event';
import type { LoanClosed } from '@/contexts/servicing/ledger/domain/events/loan-closed.event';
import type { LoanInstalmentDueNoted } from '@/contexts/servicing/ledger/domain/events/loan-instalment-due-noted.event';
import type { LoanEarlyRepaymentRecorded } from '@/contexts/servicing/ledger/domain/events/loan-early-repayment-recorded.event';
import type { LoanWrittenOff } from '@/contexts/servicing/ledger/domain/events/loan-written-off.event';
import type { LoanWriteOffReversed } from '@/contexts/servicing/ledger/domain/events/loan-write-off-reversed.event';
import type { LoanRescheduled } from '@/contexts/servicing/ledger/domain/events/loan-rescheduled.event';
import type { LoanWithdrawalRepaymentRecorded } from '@/contexts/servicing/ledger/domain/events/loan-withdrawal-repayment-recorded.event';

export type LoanEvent =
  | LoanPaidOut
  | LoanClosed
  | LoanScheduled
  | LoanInstalmentDueNoted
  | LoanEarlyRepaymentRecorded
  | LoanWrittenOff
  | LoanWriteOffReversed
  | LoanRescheduled
  | LoanWithdrawalRepaymentRecorded;
