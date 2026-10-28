import { describe, expect, it } from '@jest/globals';
import { CustomerHighRiskApproved } from '@/contexts/customer-due-diligence/domain/events/customer-high-risk-approved.event';

describe('CustomerHighRiskApproved', () => {
  it('is named after the context, the aggregate and the fact', () => {
    const event = new CustomerHighRiskApproved('customer-1', new Date('2026-01-01T00:00:00.000Z'));

    expect(event.name).toBe('customer-due-diligence.customer.high-risk-approved');
    expect(event.aggregateId).toBe('customer-1');
  });
});
