import { describe, expect, it } from '@jest/globals';
import { Money } from '@/shared-kernel/money.vo';
import { OfferTermsService } from '@/contexts/credit-application/offer/domain/services/offer-terms.service';

const facts = {
  applicationId: 'application-1',
  amount: Money.ofCents(1_000_000),
  durationMonths: 60,
  rateBasisPoints: 590,
  arrangementFee: Money.ofCents(0),
  legalMaximumBasisPoints: 1_250,
};

describe('OfferTermsService', () => {
  it('prices the constant instalment at the rate of the grid, to the cent', () => {
    const terms = new OfferTermsService().termsOf(facts);

    expect(terms.instalmentCents).toBe(19_286);
    expect(terms.amountCents).toBe(1_000_000);
    expect(terms.durationMonths).toBe(60);
  });

  it('states an annual percentage rate above the nominal rate, which compounds monthly', () => {
    const terms = new OfferTermsService().termsOf(facts);

    expect(terms.annualPercentageRateTenths).toBe(61);
  });

  it('raises the annual percentage rate by the arrangement fee, paid out of the credit', () => {
    const terms = new OfferTermsService().termsOf({ ...facts, arrangementFee: Money.ofCents(30_000) });

    expect(terms.annualPercentageRateTenths).toBeGreaterThan(61);
    expect(terms.arrangementFeeCents).toBe(30_000);
  });
});
