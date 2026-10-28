import { describe, expect, it } from '@jest/globals';
import { LoanWithdrawalRepaymentRecorded } from '@/contexts/servicing/ledger/domain/events/loan-withdrawal-repayment-recorded.event';
import { Money } from '@/shared-kernel/money.vo';

describe('LoanWithdrawalRepaymentRecorded', () => {
  it('is named after the context, the aggregate and the fact, and carries the capital and the interest repaid', () => {
    const event = new LoanWithdrawalRepaymentRecorded(
      'loan-1',
      new Date('2026-01-01T00:00:00.000Z'),
      Money.ofCents(100_000),
      Money.ofCents(410),
    );

    expect(event.name).toBe('servicing.loan.withdrawal-repayment-recorded');
    expect(event.aggregateId).toBe('loan-1');
    expect(event.capital.cents).toBe(100_000);
    expect(event.interest.cents).toBe(410);
  });
});
