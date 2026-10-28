import { describe, expect, it } from '@jest/globals';
import { OfferIssued } from '@/contexts/credit-application/offer/domain/events/offer-issued.event';

describe('OfferIssued', () => {
  it('is named after the context, the aggregate and the fact', () => {
    const terms = {
      applicationId: 'application-1',
      amountCents: 1_000_000,
      durationMonths: 60,
      rateBasisPoints: 590,
      annualPercentageRateTenths: 61,
      instalmentCents: 19_286,
      arrangementFeeCents: 0,
      legalMaximumBasisPoints: 1_250,
    };

    const event = new OfferIssued('offer-1', new Date('2026-01-01T00:00:00.000Z'), terms);

    expect(event.name).toBe('credit-application.offer.issued');
    expect(event.aggregateId).toBe('offer-1');
    expect(event.terms).toEqual(terms);
  });
});
