import { describe, expect, it } from '@jest/globals';
import { CustomerRelationshipEnded } from '@/contexts/customer-due-diligence/domain/events/customer-relationship-ended.event';

describe('CustomerRelationshipEnded', () => {
  it('is named after the context, the aggregate and the fact', () => {
    const event = new CustomerRelationshipEnded('customer-1', new Date('2026-01-01T00:00:00.000Z'));

    expect(event.name).toBe('customer-due-diligence.customer.relationship-ended');
    expect(event.aggregateId).toBe('customer-1');
  });
});
