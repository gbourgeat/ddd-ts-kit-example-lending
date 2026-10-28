import { describe, expect, it } from '@jest/globals';
import { LoanClosed } from '@/contexts/servicing/ledger/domain/events/loan-closed.event';
import { LoanWithdrawalRepaymentRecorded } from '@/contexts/servicing/ledger/domain/events/loan-withdrawal-repayment-recorded.event';
import { aLoan } from '@/contexts/servicing/test/builders/loan.builder';
import { Money } from '@/shared-kernel/money.vo';

const paidOutOn = new Date('2026-03-01T00:00:00.000Z');
const withdrawnOn = new Date('2026-03-31T00:00:00.000Z');

describe('A loan repaid by the withdrawal of its application', () => {
  it('repays the capital as paid out and the interest accrued since the payout, then closes', () => {
    const loan = aLoan().identifiedBy('loan-1').bornAt(paidOutOn).build();

    loan.repayOnWithdrawal(withdrawnOn);

    expect(loan.pullEvents()).toEqual(
      expect.arrayContaining([
        new LoanWithdrawalRepaymentRecorded('loan-1', withdrawnOn, Money.ofCents(100_000), Money.ofCents(410)),
        new LoanClosed('loan-1', withdrawnOn),
      ]),
    );
  });

  it('records nothing when the loan is already closed, as a delivery seen again', () => {
    const loan = aLoan().identifiedBy('loan-1').bornAt(paidOutOn).build();

    loan.close(new Date('2026-03-10T00:00:00.000Z'));
    loan.pullEvents();

    loan.repayOnWithdrawal(withdrawnOn);

    expect(loan.pullEvents()).toEqual([]);
  });
});
