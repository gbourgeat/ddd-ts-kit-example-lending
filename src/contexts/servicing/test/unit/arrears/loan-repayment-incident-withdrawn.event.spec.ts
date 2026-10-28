import { describe, expect, it } from '@jest/globals';
import { LoanRepaymentIncidentWithdrawn } from '@/contexts/servicing/arrears/domain/events/loan-repayment-incident-withdrawn.event';

describe('LoanRepaymentIncidentWithdrawn', () => {
  it('is named after the context, the aggregate and the fact', () => {
    const event = new LoanRepaymentIncidentWithdrawn('loan-1', new Date('2026-01-01T00:00:00.000Z'));

    expect(event.name).toBe('servicing.loan.repayment-incident-withdrawn');
    expect(event.aggregateId).toBe('loan-1');
  });
});
