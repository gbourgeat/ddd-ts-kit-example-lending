import { describe, expect, it } from '@jest/globals';
import { CustomerDirectorsAndOwnersDeclared } from '@/contexts/customer-due-diligence/domain/events/customer-directors-and-owners-declared.event';

describe('CustomerDirectorsAndOwnersDeclared', () => {
  it('is named after the context, the aggregate and the fact', () => {
    const event = new CustomerDirectorsAndOwnersDeclared('customer-1', new Date('2026-01-01T00:00:00.000Z'));

    expect(event.name).toBe('customer-due-diligence.customer.directors-and-owners-declared');
    expect(event.aggregateId).toBe('customer-1');
  });
});
