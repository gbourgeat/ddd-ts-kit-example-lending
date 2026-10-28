import { describe, expect, it } from '@jest/globals';
import { CustomerPossibleMatchDismissed } from '@/contexts/customer-due-diligence/domain/events/customer-possible-match-dismissed.event';

describe('CustomerPossibleMatchDismissed', () => {
  it('is named after the context, the aggregate and the fact, and keeps the reason of compliance', () => {
    const event = new CustomerPossibleMatchDismissed(
      'customer-1',
      new Date('2026-01-01T00:00:00.000Z'),
      'Another person with the same name',
    );

    expect(event.name).toBe('customer-due-diligence.customer.possible-match-dismissed');
    expect(event.aggregateId).toBe('customer-1');
    expect(event.reason).toBe('Another person with the same name');
  });
});
