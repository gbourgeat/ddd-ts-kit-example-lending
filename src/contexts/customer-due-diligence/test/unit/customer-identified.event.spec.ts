import { describe, expect, it } from '@jest/globals';
import { CustomerIdentified } from '@/contexts/customer-due-diligence/domain/events/customer-identified.event';

describe('CustomerIdentified', () => {
  it('is named after the context, the aggregate and the fact', () => {
    const event = new CustomerIdentified('customer-1', new Date('2026-01-01T00:00:00.000Z'));

    expect(event.name).toBe('customer-due-diligence.customer.identified');
    expect(event.aggregateId).toBe('customer-1');
  });
});
