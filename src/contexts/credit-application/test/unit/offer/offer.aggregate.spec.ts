import { describe, expect, it } from '@jest/globals';
import { expectRefusal } from '@ddd-ts-kit/testing';
import { Offer } from '@/contexts/credit-application/offer/domain/aggregates/offer.aggregate';
import { anOffer } from '@/contexts/credit-application/test/builders/offer.builder';

describe('Offer', () => {
  it('is drafted with its identity and the instant of the draft', () => {
    const draftedAt = new Date('2026-03-01T00:00:00.000Z');

    const drafted = anOffer().identifiedBy('offer-7').bornAt(draftedAt).build();

    expect(drafted.id).toBe('offer-7');
    expect(drafted.registeredAt).toEqual(draftedAt);
  });

  it('records the fact that it was drafted, with its terms', () => {
    const drafted = anOffer().identifiedBy('offer-7').build();

    expect(drafted.pullEvents()).toEqual([
      expect.objectContaining({ name: 'credit-application.offer.drafted', terms: drafted.terms }),
    ]);
  });

  it('is refused when its annual percentage rate is above the legal maximum in force', () => {
    expectRefusal(() => anOffer().atAnnualPercentageRate(126).underMaximum(1_250).build(), 'OFFER_ABOVE_LEGAL_MAXIMUM');
  });

  it('is rehydrated in its stored state without recording a new fact', () => {
    const stored = anOffer().build();

    const loaded = Offer.rehydrate(stored.id, stored.toState());

    expect(loaded.toState()).toEqual(stored.toState());
    expect(loaded.pullEvents()).toEqual([]);
  });
});
