import { describe, expect, it } from '@jest/globals';
import { expectSnapshotEquivalence } from '@ddd-ts-kit/testing';
import { Loan } from '@/contexts/servicing/ledger/domain/aggregates/loan.aggregate';
import { LoanPaidOut } from '@/contexts/servicing/ledger/domain/events/loan-paid-out.event';
import { LoanScheduled } from '@/contexts/servicing/ledger/domain/events/loan-scheduled.event';
import { LoanInstalmentDueNoted } from '@/contexts/servicing/ledger/domain/events/loan-instalment-due-noted.event';
import { LoanEarlyRepaymentRecorded } from '@/contexts/servicing/ledger/domain/events/loan-early-repayment-recorded.event';
import { LoanRescheduled } from '@/contexts/servicing/ledger/domain/events/loan-rescheduled.event';
import { LoanWrittenOff } from '@/contexts/servicing/ledger/domain/events/loan-written-off.event';
import { loanSnapshots } from '@/contexts/servicing/ledger/infrastructure/persistence/loan-events.mapper';
import { LoanPaymentReceived } from '@/contexts/servicing/instalments/domain/events/loan-payment-received.event';
import { LoanInstalmentMarkedUnpaid } from '@/contexts/servicing/instalments/domain/events/loan-instalment-marked-unpaid.event';
import { Borrower } from '@/contexts/servicing/ledger/domain/value-objects/borrower.vo';
import { LoanSchedule } from '@/contexts/servicing/ledger/domain/value-objects/loan-schedule.vo';
import type { LoanEvent } from '@/contexts/servicing/ledger/domain/values/loan-event';
import type { LoanState } from '@/contexts/servicing/ledger/domain/values/loan-state';
import { Money } from '@/shared-kernel/money.vo';

const LOAN_ID = 'loan-1';
const PAID_OUT_ON = new Date('2026-01-10T00:00:00.000Z');
const FIRST_DUE_ON = new Date('2026-02-10T00:00:00.000Z');
const SECOND_DUE_ON = new Date('2026-03-10T00:00:00.000Z');
const INSTALMENT = Money.ofCents(8_000);

describe('Loan snapshots', () => {
  it('rebuilds a loan from its snapshot at every version of its history, as its full replay does', () => {
    const history: LoanEvent[] = [
      new LoanPaidOut(LOAN_ID, PAID_OUT_ON, Borrower.create('Ada Lovelace', '1 rue de la Paix, 75002 Paris')),
      new LoanScheduled(LOAN_ID, PAID_OUT_ON, LoanSchedule.of(Money.ofCents(100_000), 500, 12)),
      new LoanInstalmentDueNoted(LOAN_ID, FIRST_DUE_ON, 1, FIRST_DUE_ON, INSTALMENT),
      new LoanPaymentReceived(LOAN_ID, FIRST_DUE_ON, 1, INSTALMENT),
      new LoanInstalmentDueNoted(LOAN_ID, SECOND_DUE_ON, 2, SECOND_DUE_ON, INSTALMENT),
      new LoanInstalmentMarkedUnpaid(LOAN_ID, SECOND_DUE_ON, 2),
      new LoanEarlyRepaymentRecorded(LOAN_ID, SECOND_DUE_ON, Money.ofCents(10_000), Money.ofCents(100)),
      new LoanWrittenOff(LOAN_ID, SECOND_DUE_ON, Money.ofCents(85_000)),
    ];

    expect(() => expectSnapshotEquivalence(proofOf(history))).not.toThrow();
  });

  it('rebuilds a rescheduled loan from its snapshot at every version of its history', () => {
    const history: LoanEvent[] = [
      new LoanPaidOut(LOAN_ID, PAID_OUT_ON, Borrower.create('Ada Lovelace', '1 rue de la Paix, 75002 Paris')),
      new LoanScheduled(LOAN_ID, PAID_OUT_ON, LoanSchedule.of(Money.ofCents(100_000), 500, 12)),
      new LoanInstalmentDueNoted(LOAN_ID, FIRST_DUE_ON, 1, FIRST_DUE_ON, INSTALMENT),
      new LoanEarlyRepaymentRecorded(LOAN_ID, FIRST_DUE_ON, Money.ofCents(10_000), Money.ofCents(100)),
      new LoanRescheduled(LOAN_ID, SECOND_DUE_ON, 'decision-1', LoanSchedule.of(Money.ofCents(90_000), 500, 24)),
      new LoanInstalmentDueNoted(LOAN_ID, SECOND_DUE_ON, 2, SECOND_DUE_ON, INSTALMENT),
    ];

    expect(() => expectSnapshotEquivalence(proofOf(history))).not.toThrow();
  });
});

/** The proof of equivalence for a history: the loan replayed as the repository replays it, against the snapshot policy of the repository. */
function proofOf(history: LoanEvent[]) {
  return {
    events: history,
    rehydrate: (id: string, historyOfLoan: Parameters<typeof Loan.rehydrate>[1]) => Loan.rehydrate(id, historyOfLoan),
    policy: loanSnapshots,
    state: (loan: Loan): LoanState => loan.toState(),
  };
}
