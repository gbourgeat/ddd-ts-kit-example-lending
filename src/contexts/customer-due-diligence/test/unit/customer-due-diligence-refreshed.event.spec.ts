import { describe, expect, it } from '@jest/globals';
import { CustomerDueDiligenceRefreshed } from '@/contexts/customer-due-diligence/domain/events/customer-due-diligence-refreshed.event';

describe('Customer due diligence refreshed', () => {
  it('carries the screening outcome and the date the due diligence falls due again, and is named after the refresh', () => {
    const event = new CustomerDueDiligenceRefreshed(
      'acme',
      new Date('2026-01-10T00:00:00.000Z'),
      false,
      new Date('2027-01-10T00:00:00.000Z'),
    );

    expect(CustomerDueDiligenceRefreshed.eventName).toBe('customer-due-diligence.customer.due-diligence-refreshed');
    expect(event.possibleMatch).toBe(false);
    expect(event.nextDueOn).toEqual(new Date('2027-01-10T00:00:00.000Z'));
    expect(event.riskRating).toBeUndefined();
  });
});
