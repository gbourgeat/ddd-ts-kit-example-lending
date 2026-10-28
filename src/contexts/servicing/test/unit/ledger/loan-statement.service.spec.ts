import { describe, expect, it } from '@jest/globals';
import { expectRefusal } from '@ddd-ts-kit/testing';
import { LoanStatementService } from '@/contexts/servicing/ledger/domain/services/loan-statement.service';
import { LoanPaidOut } from '@/contexts/servicing/ledger/domain/events/loan-paid-out.event';
import { LoanScheduled } from '@/contexts/servicing/ledger/domain/events/loan-scheduled.event';
import { LoanInstalmentDueNoted } from '@/contexts/servicing/ledger/domain/events/loan-instalment-due-noted.event';
import { LoanPaymentReceived } from '@/contexts/servicing/instalments/domain/events/loan-payment-received.event';
import { LoanInstalmentMarkedUnpaid } from '@/contexts/servicing/instalments/domain/events/loan-instalment-marked-unpaid.event';
import { Borrower } from '@/contexts/servicing/ledger/domain/value-objects/borrower.vo';
import { LoanSchedule } from '@/contexts/servicing/ledger/domain/value-objects/loan-schedule.vo';
import type { LoanEvent } from '@/contexts/servicing/ledger/domain/values/loan-event';
import { Money } from '@/shared-kernel/money.vo';

const LOAN_ID = 'loan-1';
const PAID_OUT_ON = new Date('2026-01-10T00:00:00.000Z');
const FIRST_DUE_ON = new Date('2026-02-10T00:00:00.000Z');
const SECOND_DUE_ON = new Date('2026-03-10T00:00:00.000Z');
const MID_MARCH = new Date('2026-03-15T00:00:00.000Z');
const INSTALMENT = Money.ofCents(8_000);

describe('LoanStatementService', () => {
  const service = new LoanStatementService();

  it('holds no state of its own', () => {
    expect(Object.keys(new LoanStatementService())).toEqual([]);
  });

  it('counts the instalments noted due by the date, and none noted after it', () => {
    const history = [...payout(), noted(1, FIRST_DUE_ON), noted(2, SECOND_DUE_ON)];

    const statement = service.of(LOAN_ID, history, new Date('2026-02-20T00:00:00.000Z'));

    expect(statement.instalmentsDue).toEqual([1]);
  });

  it('reads the arrears as the unpaid instalments, and the days since the oldest one fell due', () => {
    const history = [...payout(), noted(1, FIRST_DUE_ON), noted(2, SECOND_DUE_ON), unpaid(1, FIRST_DUE_ON)];

    const statement = service.of(LOAN_ID, history, MID_MARCH);

    expect(statement).toMatchObject({ arrears: INSTALMENT, daysPastDue: 33, instalmentsUnpaid: [1] });
  });

  it('shows no arrears for an instalment whose direct debit was accepted by the date', () => {
    const history = [...payout(), noted(1, FIRST_DUE_ON), received(1, FIRST_DUE_ON)];

    const statement = service.of(LOAN_ID, history, MID_MARCH);

    expect(statement).toMatchObject({ arrears: Money.ofCents(0), daysPastDue: 0, instalmentsPaid: [1] });
  });

  it('ignores a rejected direct debit recorded after the date', () => {
    const history = [...payout(), noted(1, FIRST_DUE_ON), unpaid(1, MID_MARCH)];

    const statement = service.of(LOAN_ID, history, new Date('2026-03-01T00:00:00.000Z'));

    expect(statement.instalmentsUnpaid).toEqual([]);
  });

  it('refuses a date before the loan was paid out, as an unknown loan', () => {
    const history = [...payout(), noted(1, FIRST_DUE_ON)];

    expectRefusal(() => service.of(LOAN_ID, history, new Date('2026-01-01T00:00:00.000Z')), 'UNKNOWN_LOAN');
  });
});

/** The payout of the loan and its schedule: 1000 euros over twelve months at five percent. */
function payout(): LoanEvent[] {
  const borrower = Borrower.create('Ada Lovelace', '1 rue de la Paix, 75002 Paris');
  const schedule = LoanSchedule.of(Money.ofCents(100_000), 500, 12);

  return [new LoanPaidOut(LOAN_ID, PAID_OUT_ON, borrower), new LoanScheduled(LOAN_ID, PAID_OUT_ON, schedule)];
}

function noted(number: number, dueOn: Date): LoanEvent {
  return new LoanInstalmentDueNoted(LOAN_ID, dueOn, number, dueOn, INSTALMENT);
}

function received(number: number, at: Date): LoanEvent {
  return new LoanPaymentReceived(LOAN_ID, at, number, INSTALMENT);
}

function unpaid(number: number, at: Date): LoanEvent {
  return new LoanInstalmentMarkedUnpaid(LOAN_ID, at, number);
}
