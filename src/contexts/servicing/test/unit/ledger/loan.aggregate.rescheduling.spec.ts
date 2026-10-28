import { describe, expect, it } from '@jest/globals';
import { givenEvents } from '@ddd-ts-kit/testing';
import { Loan } from '@/contexts/servicing/ledger/domain/aggregates/loan.aggregate';
import { LoanClosed } from '@/contexts/servicing/ledger/domain/events/loan-closed.event';
import { LoanInstalmentDueNoted } from '@/contexts/servicing/ledger/domain/events/loan-instalment-due-noted.event';
import { LoanPaidOut } from '@/contexts/servicing/ledger/domain/events/loan-paid-out.event';
import { LoanRescheduled } from '@/contexts/servicing/ledger/domain/events/loan-rescheduled.event';
import { LoanScheduled } from '@/contexts/servicing/ledger/domain/events/loan-scheduled.event';
import { LoanWrittenOff } from '@/contexts/servicing/ledger/domain/events/loan-written-off.event';
import { Borrower } from '@/contexts/servicing/ledger/domain/value-objects/borrower.vo';
import { LoanSchedule } from '@/contexts/servicing/ledger/domain/value-objects/loan-schedule.vo';
import { Money } from '@/shared-kernel/money.vo';

const bornAt = new Date('2026-03-01T00:00:00.000Z');
const rescheduledAt = new Date('2026-06-15T00:00:00.000Z');
const borrower = Borrower.create('Ada Lovelace', '1 rue de la Paix, 75002 Paris');
const schedule = LoanSchedule.of(Money.ofCents(100_000), 500, 12);
const rescheduling = LoanSchedule.of(Money.ofCents(80_000), 500, 6);
const decision = { id: 'decision-1', capital: Money.ofCents(80_000), durationMonths: 6 };
const paidOut = [new LoanPaidOut('loan-1', bornAt, borrower), new LoanScheduled('loan-1', bornAt, schedule)];
const instalmentAmount = Money.ofCents(8_000);

describe('A loan rescheduled over a new duration', () => {
  it('records the rescheduling with its decision, its instant and the new schedule', () => {
    givenEvents((id, history) => Loan.rehydrate(id, history), paidOut)
      .when((loan) => loan.reschedule(decision, rescheduledAt))
      .thenEventNames([LoanRescheduled.eventName])
      .thenState((loan) => {
        expect(loan.currentSchedule).toEqual(rescheduling);
      });
  });

  it('keeps its principal as paid out and its rate, and owes the rescheduled capital', () => {
    givenEvents((id, history) => Loan.rehydrate(id, history), paidOut)
      .when((loan) => loan.reschedule(decision, rescheduledAt))
      .thenState((loan) => {
        expect(loan.schedule?.principal.cents).toBe(100_000);
        expect(loan.currentSchedule?.annualRateBasisPoints).toBe(500);
        expect(loan.outstandingCapital.cents).toBe(80_000);
      });
  });

  it('numbers its new instalments after those noted due before the rescheduling, and notes them when they fall due', () => {
    givenEvents(
      (id, history) => Loan.rehydrate(id, history),
      [
        ...paidOut,
        noted(1, '2026-04-01T00:00:00.000Z'),
        noted(2, '2026-05-01T00:00:00.000Z'),
        noted(3, '2026-06-01T00:00:00.000Z'),
      ],
    )
      .when((loan) => {
        loan.reschedule(decision, rescheduledAt);
        loan.computeDueInstalments(new Date('2026-07-01T00:00:00.000Z'));
      })
      .thenEventNames([LoanRescheduled.eventName, LoanInstalmentDueNoted.eventName])
      .thenState((loan) => {
        expect(loan.instalmentsDue).toEqual([1, 2, 3, 4]);
      });
  });

  it('records nothing again for a decision the loan already recorded', () => {
    givenEvents(
      (id, history) => Loan.rehydrate(id, history),
      [...paidOut, new LoanRescheduled('loan-1', rescheduledAt, decision.id, rescheduling)],
    )
      .when((loan) => loan.reschedule(decision, new Date('2026-07-01T00:00:00.000Z')))
      .thenNoEvent();
  });

  it('refuses to reschedule a closed loan, with LOAN_ALREADY_CLOSED', () => {
    givenEvents((id, history) => Loan.rehydrate(id, history), [...paidOut, new LoanClosed('loan-1', rescheduledAt)])
      .when((loan) => loan.reschedule({ ...decision, id: 'decision-2' }, rescheduledAt))
      .thenError('LOAN_ALREADY_CLOSED');
  });

  it('refuses to reschedule a written-off loan, with LOAN_ALREADY_CLOSED', () => {
    givenEvents(
      (id, history) => Loan.rehydrate(id, history),
      [...paidOut, new LoanWrittenOff('loan-1', rescheduledAt, Money.ofCents(100_000))],
    )
      .when((loan) => loan.reschedule(decision, rescheduledAt))
      .thenError('LOAN_ALREADY_CLOSED');
  });
});

function noted(number: number, dueOn: string): LoanInstalmentDueNoted {
  return new LoanInstalmentDueNoted('loan-1', new Date(dueOn), number, new Date(dueOn), instalmentAmount);
}
