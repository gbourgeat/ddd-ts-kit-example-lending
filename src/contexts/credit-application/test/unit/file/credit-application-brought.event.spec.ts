import { describe, expect, it } from '@jest/globals';
import { CreditApplicationBrought } from '@/contexts/credit-application/file/domain/events/credit-application-brought.event';

describe('CreditApplicationBrought', () => {
  it('is named after the context, the aggregate and the fact, and carries the broker who brought the application', () => {
    const event = new CreditApplicationBrought(
      'credit-application-1',
      new Date('2026-01-01T00:00:00.000Z'),
      'broker-1',
    );

    expect(event.name).toBe('credit-application.credit-application.brought');
    expect(event.aggregateId).toBe('credit-application-1');
    expect(event.brokerId).toBe('broker-1');
  });
});
