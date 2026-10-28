import { describe, expect, it } from '@jest/globals';
import { LoanWriteOffReversed } from '@/contexts/servicing/ledger/domain/events/loan-write-off-reversed.event';
import { Money } from '@/shared-kernel/money.vo';

describe('LoanWriteOffReversed', () => {
  it('is named after the context, the aggregate and the fact', () => {
    const event = new LoanWriteOffReversed('loan-1', new Date('2026-01-01T00:00:00.000Z'), Money.ofCents(100_000));

    expect(event.name).toBe('servicing.loan.write-off-reversed');
    expect(event.aggregateId).toBe('loan-1');
    expect(event.amount.cents).toBe(100_000);
  });
});
