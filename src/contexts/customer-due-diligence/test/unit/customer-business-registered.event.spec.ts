import { describe, expect, it } from '@jest/globals';
import { CustomerBusinessRegistered } from '@/contexts/customer-due-diligence/domain/events/customer-business-registered.event';

describe('CustomerBusinessRegistered', () => {
  it('is named after the context, the aggregate and the fact', () => {
    const event = new CustomerBusinessRegistered('customer-1', new Date('2026-01-01T00:00:00.000Z'));

    expect(event.name).toBe('customer-due-diligence.customer.business-registered');
    expect(event.aggregateId).toBe('customer-1');
  });
});
