import { describe, expect, it } from '@jest/globals';
import { CustomerDueDiligenceFlaggedOverdue } from '@/contexts/customer-due-diligence/domain/events/customer-due-diligence-flagged-overdue.event';

describe('CustomerDueDiligenceFlaggedOverdue', () => {
  it('is named after the context, the aggregate and the fact', () => {
    const event = new CustomerDueDiligenceFlaggedOverdue('customer-1', new Date('2026-01-01T00:00:00.000Z'));

    expect(event.name).toBe('customer-due-diligence.customer.due-diligence-flagged-overdue');
    expect(event.aggregateId).toBe('customer-1');
  });
});
