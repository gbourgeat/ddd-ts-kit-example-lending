import { describe, expect, it } from '@jest/globals';
import { given, givenEvents } from '@ddd-ts-kit/testing';
import { Loan } from '@/contexts/servicing/ledger/domain/aggregates/loan.aggregate';
import { LoanClosed } from '@/contexts/servicing/ledger/domain/events/loan-closed.event';
import { LoanPaidOut } from '@/contexts/servicing/ledger/domain/events/loan-paid-out.event';
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

    expect(loan.pullEvents()).toEqual([new LoanPaidOut('loan-1', bornAt, loan.borrower)]);
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
