import { Borrower } from '@/contexts/servicing/ledger/domain/value-objects/borrower.vo';
import { describe, expect, it } from '@jest/globals';
import { givenEvents } from '@ddd-ts-kit/testing';
import { Loan } from '@/contexts/servicing/ledger/domain/aggregates/loan.aggregate';
import { LoanPaidOut } from '@/contexts/servicing/ledger/domain/events/loan-paid-out.event';
import { LoanScheduled } from '@/contexts/servicing/ledger/domain/events/loan-scheduled.event';
import { LoanSchedule } from '@/contexts/servicing/ledger/domain/value-objects/loan-schedule.vo';
import { Money } from '@/shared-kernel/money.vo';

const bornAt = new Date('2026-03-01T00:00:00.000Z');
const borrower = Borrower.create('Ada Lovelace', '1 rue de la Paix, 75002 Paris');
const schedule = LoanSchedule.of(Money.ofCents(100_000), 500, 12);

describe('Loan', () => {
  it('records its payout and its schedule, and holds the state those events give', () => {
    const born = Loan.create('loan-7', { paidOutAt: bornAt, borrower, schedule });

    expect(born.registeredAt).toEqual(bornAt);
    expect(born.schedule).toEqual(schedule);

    expect(born.pullEvents()).toEqual([
      new LoanPaidOut('loan-7', bornAt, borrower),
      new LoanScheduled('loan-7', bornAt, schedule),
    ]);
  });

  it('is rebuilt from its history, recording nothing', () => {
    givenEvents((id, history) => Loan.rehydrate(id, history), [new LoanPaidOut('loan-7', bornAt)])
      .when((loaded) => loaded.toState())
      .thenNoEvent()
      .thenState((loaded) => expect(loaded.version).toBe(1));
  });

  // TODO(domain): replace each entry below by a test named after the business rule it proves: given the events of a history, when one command, then the events it records (`thenEvents`) or the refusal (`thenError`).
  it.todo('refuses to be born when a birth invariant is violated');
  it.todo('records a fact for each business intention, and changes state only through it');
});
