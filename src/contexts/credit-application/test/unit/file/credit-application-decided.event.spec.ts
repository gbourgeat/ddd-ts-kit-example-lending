import { describe, expect, it } from '@jest/globals';
import { CreditApplicationDecided } from '@/contexts/credit-application/file/domain/events/credit-application-decided.event';

describe('CreditApplicationDecided', () => {
  it('is named after the context, the aggregate and the fact, and keeps the decision', () => {
    const event = new CreditApplicationDecided(
      'credit-application-1',
      new Date('2026-01-01T00:00:00.000Z'),
      'approve',
      'staff-1',
      'advisor',
      '',
      '',
      1_234_567,
    );

    expect(event.name).toBe('credit-application.credit-application.decided');
    expect(event.aggregateId).toBe('credit-application-1');

    expect(event).toMatchObject({
      outcome: 'approve',
      deciderId: 'staff-1',
      level: 'advisor',
      approvedAmountCents: 1_234_567,
    });
  });
});
