import { describe, expect, it } from '@jest/globals';
import { LoanDefaulted } from '@/contexts/servicing/arrears/domain/events/loan-defaulted.event';

describe('LoanDefaulted', () => {
  it('is named after the context, the aggregate and the fact', () => {
    const event = new LoanDefaulted('loan-1', new Date('2026-05-11T00:00:00.000Z'));

    expect(event.name).toBe('servicing.loan.defaulted');
    expect(event.aggregateId).toBe('loan-1');
  });
});
