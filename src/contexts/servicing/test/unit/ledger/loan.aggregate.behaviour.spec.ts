import { describe, expect, it } from '@jest/globals';
import { given } from '@ddd-ts-kit/testing';
import { LoanPaidOut } from '@/contexts/servicing/ledger/domain/events/loan-paid-out.event';
import { aLoan } from '@/contexts/servicing/test/builders/loan.builder';

const bornAt = new Date('2026-03-01T00:00:00.000Z');

describe('A loan paid out to its borrower', () => {
  it('starts its ledger on the instant of its payout', () => {
    given(aLoan().identifiedBy('loan-1').bornAt(bornAt))
      .when((loan) => loan.toState())
      .thenNoEvent()
      .thenState((loan) => expect(loan.registeredAt).toEqual(bornAt));
  });

  it('records its payout as the fact that opens its ledger, with its identifier and instant', () => {
    const loan = aLoan().identifiedBy('loan-1').bornAt(bornAt).build();

    expect(loan.pullEvents()).toEqual([new LoanPaidOut('loan-1', bornAt)]);
  });
});
