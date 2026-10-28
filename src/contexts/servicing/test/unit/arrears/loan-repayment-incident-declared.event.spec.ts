import { describe, expect, it } from '@jest/globals';
import { LoanRepaymentIncidentDeclared } from '@/contexts/servicing/arrears/domain/events/loan-repayment-incident-declared.event';

describe('LoanRepaymentIncidentDeclared', () => {
  it('is named after the context, the aggregate and the fact', () => {
    const event = new LoanRepaymentIncidentDeclared('loan-1', new Date('2026-01-01T00:00:00.000Z'));

    expect(event.name).toBe('servicing.loan.repayment-incident-declared');
    expect(event.aggregateId).toBe('loan-1');
  });
});
