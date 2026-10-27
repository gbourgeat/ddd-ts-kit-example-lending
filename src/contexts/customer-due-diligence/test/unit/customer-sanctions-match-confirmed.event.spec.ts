import { describe, expect, it } from '@jest/globals';
import { CustomerSanctionsMatchConfirmed } from '@/contexts/customer-due-diligence/domain/events/customer-sanctions-match-confirmed.event';

describe('CustomerSanctionsMatchConfirmed', () => {
  it('is named after the context, the aggregate and the fact', () => {
    const event = new CustomerSanctionsMatchConfirmed('customer-1', new Date('2026-01-01T00:00:00.000Z'));

    expect(event.name).toBe('customer-due-diligence.customer.sanctions-match-confirmed');
    expect(event.aggregateId).toBe('customer-1');
  });
});
