import { describe, expect, it } from '@jest/globals';
import { LoanPaidOut } from '@/contexts/servicing/ledger/domain/events/loan-paid-out.event';

describe('LoanPaidOut', () => {
  it('is named after the context, the aggregate and the fact', () => {
    const event = new LoanPaidOut('loan-1', new Date('2026-01-01T00:00:00.000Z'));

    expect(event.name).toBe('servicing.loan.paid-out');
    expect(event.aggregateId).toBe('loan-1');
  });
});
