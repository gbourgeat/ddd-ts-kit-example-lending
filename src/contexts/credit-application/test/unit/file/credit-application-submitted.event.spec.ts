import { describe, expect, it } from '@jest/globals';
import { CreditApplicationSubmitted } from '@/contexts/credit-application/file/domain/events/credit-application-submitted.event';

describe('CreditApplicationSubmitted', () => {
  it('is named after the context, the aggregate and the fact, and carries the applicant', () => {
    const event = new CreditApplicationSubmitted(
      'credit-application-1',
      'customer-1',
      new Date('2026-01-01T00:00:00.000Z'),
    );

    expect(event.name).toBe('credit-application.credit-application.submitted');
    expect(event.aggregateId).toBe('credit-application-1');
    expect(event.applicantId).toBe('customer-1');
  });
});
