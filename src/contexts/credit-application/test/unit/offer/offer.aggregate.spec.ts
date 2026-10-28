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

  it('is issued on the day it is sent to the borrower, under the legal maximum in force that day', () => {
    const issuedOn = new Date('2026-04-01T00:00:00.000Z');
    const drafted = anOffer().atAnnualPercentageRate(61).underMaximum(1_250).build();

    drafted.issue(issuedOn, 611);

    expect(drafted.issuedAt).toEqual(issuedOn);
  });

  it('records the fact that it was issued, with its terms', () => {
    const drafted = anOffer().atAnnualPercentageRate(61).underMaximum(1_250).build();

    drafted.issue(new Date('2026-04-01T00:00:00.000Z'), 611);

    expect(drafted.pullEvents()).toContainEqual(
      expect.objectContaining({ name: 'credit-application.offer.issued', terms: drafted.terms }),
    );
  });

  it('is refused to issue when its annual percentage rate is at the legal maximum in force that day', () => {
    const drafted = anOffer().atAnnualPercentageRate(61).underMaximum(1_250).build();

    expectRefusal(() => drafted.issue(new Date('2026-04-01T00:00:00.000Z'), 610), 'OFFER_ABOVE_LEGAL_MAXIMUM');
    expect(drafted.issuedAt).toBeUndefined();
  });
});
