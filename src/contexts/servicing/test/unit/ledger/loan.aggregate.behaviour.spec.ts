import { describe, expect, it } from '@jest/globals';
import { given, givenEvents } from '@ddd-ts-kit/testing';
import { Loan } from '@/contexts/servicing/ledger/domain/aggregates/loan.aggregate';
import { LoanClosed } from '@/contexts/servicing/ledger/domain/events/loan-closed.event';
import { LoanPaidOut } from '@/contexts/servicing/ledger/domain/events/loan-paid-out.event';
import { LoanInstalmentDueNoted } from '@/contexts/servicing/ledger/domain/events/loan-instalment-due-noted.event';
import { aLoan } from '@/contexts/servicing/test/builders/loan.builder';

const bornAt = new Date('2026-03-01T00:00:00.000Z');
const closedAt = new Date('2031-03-01T00:00:00.000Z');

describe('A loan paid out to its borrower', () => {
  it('starts its ledger on the instant of its payout', () => {
    given(aLoan().identifiedBy('loan-1').bornAt(bornAt))
      .when((loan) => loan.toState())
      .thenNoEvent()
      .thenState((loan) => expect(loan.registeredAt).toEqual(bornAt));
  });

  it('records its payout as the fact that opens its ledger, with its identifier and instant', () => {
    const loan = aLoan().identifiedBy('loan-1').bornAt(bornAt).build();

    expect(loan.pullEvents()).toContainEqual(new LoanPaidOut('loan-1', bornAt, loan.borrower));
  });
});

describe('A loan closed once its ledger is over', () => {
  it('records its closure on the instant it is closed', () => {
    givenEvents(
      (id, history) => Loan.rehydrate(id, history),
      [new LoanPaidOut('loan-1', bornAt, aLoan().build().borrower)],
    )
      .when((loan) => loan.close(closedAt))
      .thenEventNames([LoanClosed.eventName])
      .thenState((loan) => expect(loan.closedAt).toEqual(closedAt));
  });

  it('refuses to close a loan that is already closed, and records nothing', () => {
    givenEvents(
      (id, history) => Loan.rehydrate(id, history),
      [new LoanPaidOut('loan-1', bornAt), new LoanClosed('loan-1', closedAt)],
    )
      .when((loan) => loan.close(new Date('2031-04-01T00:00:00.000Z')))
      .thenError('LOAN_ALREADY_CLOSED');
  });
});

describe('A loan whose instalments fall due', () => {
  const paidOutOnTheTenthOfJanuary = new Date('2026-01-10T00:00:00.000Z');

  it('records each instalment of its schedule that has fallen due, with its number and its due date', () => {
    const loan = aLoan().identifiedBy('loan-1').bornAt(paidOutOnTheTenthOfJanuary).build();

    loan.computeDueInstalments(new Date('2026-03-10T00:00:00.000Z'));

    expect(loan.pullEvents()).toContainEqual(
      expect.objectContaining({
        number: 1,
        dueOn: new Date('2026-02-10T00:00:00.000Z'),
      }),
    );
  });

  it('records the instalments due on the instant of the run, and no instalment not yet due', () => {
    const loan = aLoan().identifiedBy('loan-1').bornAt(paidOutOnTheTenthOfJanuary).build();

    loan.computeDueInstalments(new Date('2026-03-10T00:00:00.000Z'));

    expect(loan.pullEvents().filter((event) => event.name === LoanInstalmentDueNoted.eventName)).toHaveLength(2);
  });

  it('records nothing twice when the same run is repeated', () => {
    const loan = aLoan().identifiedBy('loan-1').bornAt(paidOutOnTheTenthOfJanuary).build();
    const now = new Date('2026-03-10T00:00:00.000Z');

    loan.computeDueInstalments(now);
    loan.computeDueInstalments(now);

    expect(loan.pullEvents().filter((event) => event.name === LoanInstalmentDueNoted.eventName)).toHaveLength(2);
  });

  it('records only the instalments that fell due since the last run', () => {
    const loan = aLoan().identifiedBy('loan-1').bornAt(paidOutOnTheTenthOfJanuary).build();

    loan.computeDueInstalments(new Date('2026-02-10T00:00:00.000Z'));
    loan.computeDueInstalments(new Date('2026-03-10T00:00:00.000Z'));

    expect(loan.pullEvents().filter((event) => event.name === LoanInstalmentDueNoted.eventName)).toHaveLength(2);
  });

  it('records no instalment once the loan is closed', () => {
    givenEvents(
      (id, history) => Loan.rehydrate(id, history),
      [new LoanPaidOut('loan-1', bornAt, aLoan().build().borrower), new LoanClosed('loan-1', closedAt)],
    )
      .when((loan) => loan.computeDueInstalments(new Date('2026-03-10T00:00:00.000Z')))
      .thenNoEvent();
  });
});
