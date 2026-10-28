import { describe, expect, it } from '@jest/globals';
import { LoanWrittenOff } from '@/contexts/servicing/ledger/domain/events/loan-written-off.event';
import { Money } from '@/shared-kernel/money.vo';

describe('LoanWrittenOff', () => {
  it('is named after the context, the aggregate and the fact', () => {
    const event = new LoanWrittenOff('loan-1', new Date('2026-01-01T00:00:00.000Z'), Money.ofCents(100_000));

    expect(event.name).toBe('servicing.loan.written-off');
    expect(event.aggregateId).toBe('loan-1');
    expect(event.amount.cents).toBe(100_000);
  });
});
