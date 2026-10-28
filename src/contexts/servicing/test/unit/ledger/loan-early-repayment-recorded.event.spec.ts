import { describe, expect, it } from '@jest/globals';
import { LoanEarlyRepaymentRecorded } from '@/contexts/servicing/ledger/domain/events/loan-early-repayment-recorded.event';
import { Money } from '@/shared-kernel/money.vo';

describe('LoanEarlyRepaymentRecorded', () => {
  it('is named after the context, the aggregate and the fact', () => {
    const event = new LoanEarlyRepaymentRecorded(
      'loan-1',
      new Date('2026-01-01T00:00:00.000Z'),
      Money.ofCents(40_000),
      Money.ofCents(400),
    );

    expect(event.name).toBe('servicing.loan.early-repayment-recorded');
    expect(event.aggregateId).toBe('loan-1');
    expect(event.capital.cents).toBe(40_000);
    expect(event.fee.cents).toBe(400);
  });
});
