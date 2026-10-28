import { describe, expect, it } from '@jest/globals';
import { CreditApplicationContested } from '@/contexts/credit-application/file/domain/events/credit-application-contested.event';

describe('CreditApplicationContested', () => {
  it('is named after the context, the aggregate and the fact', () => {
    const event = new CreditApplicationContested(
      'credit-application-1',
      new Date('2026-01-01T00:00:00.000Z'),
      'applicant-1',
      'Wrong income.',
    );

    expect(event.name).toBe('credit-application.credit-application.contested');
    expect(event.aggregateId).toBe('credit-application-1');
    expect(event.reason).toBe('Wrong income.');
  });
});
