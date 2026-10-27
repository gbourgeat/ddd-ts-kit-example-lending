import { describe, expect, it } from '@jest/globals';
import { Money } from '@/shared-kernel/money.vo';
import { CreditApplicationSubmitted } from '@/contexts/credit-application/file/domain/events/credit-application-submitted.event';

describe('CreditApplicationSubmitted', () => {
  it('is named after the context, the aggregate and the fact, and carries the applicant, the amount and the duration', () => {
    const event = new CreditApplicationSubmitted(
      'credit-application-1',
      'customer-1',
      Money.ofCents(1234567),
      60,
      new Date('2026-01-01T00:00:00.000Z'),
    );

    expect(event.name).toBe('credit-application.credit-application.submitted');
    expect(event.aggregateId).toBe('credit-application-1');
    expect(event.applicantId).toBe('customer-1');
    expect(event.amount).toEqual(Money.ofCents(1234567));
    expect(event.durationMonths).toBe(60);
  });
});
