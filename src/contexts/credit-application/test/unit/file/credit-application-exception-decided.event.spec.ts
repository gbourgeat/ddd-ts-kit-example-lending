import { describe, expect, it } from '@jest/globals';
import { CreditApplicationExceptionDecided } from '@/contexts/credit-application/file/domain/events/credit-application-exception-decided.event';

describe('CreditApplicationExceptionDecided', () => {
  it('is named after the context, the aggregate and the fact', () => {
    const event = new CreditApplicationExceptionDecided(
      'credit-application-1',
      new Date('2026-01-01T00:00:00.000Z'),
      'approve',
      'committee-1',
      'The guarantor covers it.',
    );

    expect(event.name).toBe('credit-application.credit-application.exception-decided');
    expect(event.aggregateId).toBe('credit-application-1');
    expect(event.outcome).toBe('approve');
  });
});
