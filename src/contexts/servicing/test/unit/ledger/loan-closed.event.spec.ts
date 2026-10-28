import { describe, expect, it } from '@jest/globals';
import { LoanClosed } from '@/contexts/servicing/ledger/domain/events/loan-closed.event';

describe('LoanClosed', () => {
  it('is named after the context, the aggregate and the fact', () => {
    const event = new LoanClosed('loan-1', new Date('2026-01-01T00:00:00.000Z'));

    expect(event.name).toBe('servicing.loan.closed');
    expect(event.aggregateId).toBe('loan-1');
  });
});
