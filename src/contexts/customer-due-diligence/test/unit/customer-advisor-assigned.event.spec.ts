import { describe, expect, it } from '@jest/globals';
import { CustomerAdvisorAssigned } from '@/contexts/customer-due-diligence/domain/events/customer-advisor-assigned.event';

describe('CustomerAdvisorAssigned', () => {
  it('is named after the context, the aggregate and the fact, and carries the advisor', () => {
    const event = new CustomerAdvisorAssigned('customer-1', new Date('2026-01-01T00:00:00.000Z'), 'advisor-1');

    expect(event.name).toBe('customer-due-diligence.customer.advisor-assigned');
    expect(event.aggregateId).toBe('customer-1');
    expect(event.advisorId).toBe('advisor-1');
  });
});
