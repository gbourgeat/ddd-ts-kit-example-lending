import { describe, expect, it } from '@jest/globals';
import { LoanArrearsCleared } from '@/contexts/servicing/arrears/domain/events/loan-arrears-cleared.event';

describe('LoanArrearsCleared', () => {
  it('is named after the context, the aggregate and the fact', () => {
    const event = new LoanArrearsCleared('loan-1', new Date('2026-01-01T00:00:00.000Z'));

    expect(event.name).toBe('servicing.loan.arrears-cleared');
    expect(event.aggregateId).toBe('loan-1');
  });
});
