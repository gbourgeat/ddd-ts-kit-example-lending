import { describe, expect, it } from '@jest/globals';
import { CustomerRiskRated } from '@/contexts/customer-due-diligence/domain/events/customer-risk-rated.event';

describe('CustomerRiskRated', () => {
  it('is named after the context, the aggregate and the fact', () => {
    const event = new CustomerRiskRated('customer-1', new Date('2026-01-01T00:00:00.000Z'), 'high');

    expect(event.name).toBe('customer-due-diligence.customer.risk-rated');
    expect(event.aggregateId).toBe('customer-1');
    expect(event.rating).toBe('high');
  });
});
