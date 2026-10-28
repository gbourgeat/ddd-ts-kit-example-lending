import { describe, expect, it } from '@jest/globals';
import { CreditApplicationPayoutAuthorised } from '@/contexts/credit-application/offer/domain/events/credit-application-payout-authorised.event';

describe('CreditApplicationPayoutAuthorised', () => {
  it('is named after the context, the aggregate and the fact', () => {
    const event = new CreditApplicationPayoutAuthorised('credit-application-1', new Date('2026-01-01T00:00:00.000Z'));

    expect(event.name).toBe('credit-application.credit-application.payout-authorised');
    expect(event.aggregateId).toBe('credit-application-1');
  });
});
