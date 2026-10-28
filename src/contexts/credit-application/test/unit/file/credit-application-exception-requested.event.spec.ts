import { describe, expect, it } from '@jest/globals';
import { CreditApplicationExceptionRequested } from '@/contexts/credit-application/file/domain/events/credit-application-exception-requested.event';

describe('CreditApplicationExceptionRequested', () => {
  it('is named after the context, the aggregate and the fact', () => {
    const event = new CreditApplicationExceptionRequested(
      'credit-application-1',
      new Date('2026-01-01T00:00:00.000Z'),
      'advisor-1',
      'risk-manager',
      'The applicant brings a payslip showing a bonus.',
    );

    expect(event.name).toBe('credit-application.credit-application.exception-requested');
    expect(event.aggregateId).toBe('credit-application-1');
  });

  it('keeps the level the exception goes to and the justification written by the decider', () => {
    const event = new CreditApplicationExceptionRequested(
      'credit-application-1',
      new Date('2026-01-01T00:00:00.000Z'),
      'advisor-1',
      'risk-manager',
      'The applicant brings a payslip showing a bonus.',
    );

    expect(event.targetLevel).toBe('risk-manager');
    expect(event.justification).toBe('The applicant brings a payslip showing a bonus.');
  });
});
