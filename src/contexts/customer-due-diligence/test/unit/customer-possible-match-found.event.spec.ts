import { describe, expect, it } from '@jest/globals';
import { CustomerPossibleMatchFound } from '@/contexts/customer-due-diligence/domain/events/customer-possible-match-found.event';

describe('CustomerPossibleMatchFound', () => {
  it('is named after the context, the aggregate and the fact', () => {
    const event = new CustomerPossibleMatchFound('customer-1', new Date('2026-01-01T00:00:00.000Z'));

    expect(event.name).toBe('customer-due-diligence.customer.possible-match-found');
    expect(event.aggregateId).toBe('customer-1');
  });
});
