import { describe, expect, it } from '@jest/globals';
import { expectRefusal } from '@ddd-ts-kit/testing';
import { Offer } from '@/contexts/credit-application/offer/domain/aggregates/offer.aggregate';
import { anOffer } from '@/contexts/credit-application/test/builders/offer.builder';

const april = new Date('2026-04-01T00:00:00.000Z');
const fifteenDaysAfterApril = new Date('2026-04-16T00:00:00.000Z');
const oneMillisecondTooLate = new Date(fifteenDaysAfterApril.getTime() + 1);

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

  it('records the day the borrower signs an issued offer as its signing date', () => {
    const signed = issuedOffer();

    signed.accept(new Date('2026-04-03T10:00:00.000Z'));

    expect(signed.signedAt).toEqual(new Date('2026-04-03T10:00:00.000Z'));
  });

  it('accepts a signature on the fifteenth day after its issue', () => {
    const signed = issuedOffer();

    signed.accept(fifteenDaysAfterApril);

    expect(signed.signedAt).toEqual(fifteenDaysAfterApril);
  });

  it('is refused to be signed after its fifteen days of validity, with the expiry it carries', () => {
    const late = issuedOffer();

    expectRefusal(() => late.accept(oneMillisecondTooLate), 'OFFER_EXPIRED');
    expect(late.signedAt).toBeUndefined();
  });

  it('is refused to be signed before it was issued to the borrower', () => {
    const drafted = anOffer().atAnnualPercentageRate(61).underMaximum(1_250).build();

    expectRefusal(() => drafted.accept(april), 'OFFER_NOT_ISSUED');
  });

  it('is refused a second signature, and keeps the first signing date', () => {
    const signed = issuedOffer();

    signed.accept(new Date('2026-04-03T10:00:00.000Z'));

    expectRefusal(() => signed.accept(new Date('2026-04-04T10:00:00.000Z')), 'OFFER_ALREADY_ACCEPTED');
    expect(signed.signedAt).toEqual(new Date('2026-04-03T10:00:00.000Z'));
  });
});

/** An offer drafted under the maximum in force, and issued on the first of April. */
function issuedOffer(): Offer {
  const offer = anOffer().atAnnualPercentageRate(61).underMaximum(1_250).build();

  offer.issue(april, 1_250);

  return offer;
}
