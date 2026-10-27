import { describe, expect, it } from '@jest/globals';
import { CreditApplicationAccountConsentGiven } from '@/contexts/credit-application/file/domain/events/credit-application-account-consent-given.event';

describe('CreditApplicationAccountConsentGiven', () => {
  it('is named after the context, the aggregate and the fact', () => {
    const event = new CreditApplicationAccountConsentGiven(
      'credit-application-1',
      new Date('2026-01-01T00:00:00.000Z'),
      new Date('2026-04-01T00:00:00.000Z'),
    );

    expect(event.name).toBe('credit-application.credit-application.account-consent-given');
    expect(event.aggregateId).toBe('credit-application-1');
  });
});
