import { Money } from '@/shared-kernel/money.vo';
import type { LoanPaidOut } from '@/contexts/servicing/ledger/domain/events/loan-paid-out.event';
import type { LoanScheduled } from '@/contexts/servicing/ledger/domain/events/loan-scheduled.event';
import type { LoanClosed } from '@/contexts/servicing/ledger/domain/events/loan-closed.event';
import type { LoanInstalmentDueNoted } from '@/contexts/servicing/ledger/domain/events/loan-instalment-due-noted.event';
import type { LoanEarlyRepaymentRecorded } from '@/contexts/servicing/ledger/domain/events/loan-early-repayment-recorded.event';
import type { LoanWrittenOff } from '@/contexts/servicing/ledger/domain/events/loan-written-off.event';
import type { LoanRescheduled } from '@/contexts/servicing/ledger/domain/events/loan-rescheduled.event';
import type { LoanPaymentReceived } from '@/contexts/servicing/instalments/domain/events/loan-payment-received.event';
import type { LoanInstalmentMarkedUnpaid } from '@/contexts/servicing/instalments/domain/events/loan-instalment-marked-unpaid.event';
import type { LoanArrearsBucketEntered } from '@/contexts/servicing/arrears/domain/events/loan-arrears-bucket-entered.event';
import type { LoanDefaulted } from '@/contexts/servicing/arrears/domain/events/loan-defaulted.event';
import type { LoanRepaymentIncidentDeclared } from '@/contexts/servicing/arrears/domain/events/loan-repayment-incident-declared.event';
import type { LoanState } from '@/contexts/servicing/ledger/domain/values/loan-state';

/**
 * How each event changes the state of a loan: a pure function of the state and of the event, applied by the aggregate
 * when the event is recorded or replayed. The events that move no state keep the state as it is.
 */
export const loanStateChanges = {
  paidOut: (state: LoanState, event: LoanPaidOut): LoanState => ({
    ...state,
    registeredAt: event.occurredAt,
    borrower: event.borrower,
  }),

  scheduled: (state: LoanState, event: LoanScheduled): LoanState => ({ ...state, schedule: event.schedule }),

  closed: (state: LoanState, event: LoanClosed): LoanState => ({ ...state, closedAt: event.occurredAt }),

  instalmentDueNoted: (state: LoanState, event: LoanInstalmentDueNoted): LoanState => ({
    ...state,
    instalmentsDue: [...state.instalmentsDue, event.number],
  }),

  earlyRepaymentRecorded: (state: LoanState, event: LoanEarlyRepaymentRecorded): LoanState => ({
    ...state,
    earlyRepaid: Money.ofCents(state.earlyRepaid.cents + event.capital.cents),
  }),

  writtenOff: (state: LoanState, event: LoanWrittenOff): LoanState => ({
    ...state,
    writtenOff: event.amount,
    closedAt: event.occurredAt,
  }),

  writeOffReversed: (state: LoanState): LoanState => ({ ...state, writtenOff: undefined, closedAt: undefined }),

  /** The new schedule is numbered after the instalments noted so far, and counts the early repayments from now on. */
  rescheduled: (state: LoanState, event: LoanRescheduled): LoanState => ({
    ...state,
    rescheduling: {
      schedule: event.schedule,
      notedBefore: state.instalmentsDue.length,
      earlyRepaidBefore: state.earlyRepaid,
    },
    rescheduledBy: [...state.rescheduledBy, event.decisionId],
  }),

  /** The capital and the interest are paid: the loan ends with the closure recorded right after, so no state moves here. */
  withdrawalRepaymentRecorded: (state: LoanState): LoanState => state,

  paymentReceived: (state: LoanState, event: LoanPaymentReceived): LoanState => ({
    ...state,
    instalmentsPaid: [...state.instalmentsPaid, event.number],
  }),

  instalmentMarkedUnpaid: (state: LoanState, event: LoanInstalmentMarkedUnpaid): LoanState => ({
    ...state,
    instalmentsUnpaid: [...state.instalmentsUnpaid, event.number],
  }),

  arrearsBucketEntered: (state: LoanState, event: LoanArrearsBucketEntered): LoanState => ({
    ...state,
    arrearsBucket: event.bucket,
  }),

  defaulted: (state: LoanState, event: LoanDefaulted): LoanState => ({ ...state, defaultedAt: event.occurredAt }),

  repaymentIncidentDeclared: (state: LoanState, event: LoanRepaymentIncidentDeclared): LoanState => ({
    ...state,
    repaymentIncidentDeclaredAt: event.occurredAt,
  }),

  repaymentIncidentWithdrawn: (state: LoanState): LoanState => ({ ...state, repaymentIncidentDeclaredAt: undefined }),

  /** The arrears are paid: the loan carries no unpaid instalment any more, and no state moves here. */
  arrearsCleared: (state: LoanState): LoanState => state,
};
