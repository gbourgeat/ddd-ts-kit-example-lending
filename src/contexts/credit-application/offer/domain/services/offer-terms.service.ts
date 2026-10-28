import { Money } from '@/shared-kernel/money.vo';
import type { OfferedTerms } from '@/contexts/credit-application/offer/domain/events/offer-drafted.event';
import { ActuarialFormulaService } from '@/contexts/credit-application/offer/domain/services/actuarial-formula.service';

const BASIS_POINTS_PER_UNIT = 10_000;

/** What prices an offer: the approved application, the rate of its grid, the fee of its product and the maximum in force. */
export interface OfferPriceFacts {
  readonly applicationId: string;
  readonly amount: Money;
  readonly durationMonths: number;
  readonly rateBasisPoints: number;
  readonly arrangementFee: Money;
  readonly legalMaximumBasisPoints: number;
}

/** Prices an offer: the constant instalment at the grid rate, and the annual percentage rate by the actuarial formula. */
export class OfferTermsService {
  private readonly formula = new ActuarialFormulaService();

  termsOf(facts: OfferPriceFacts): OfferedTerms {
    const { amount, durationMonths: months, arrangementFee } = facts;

    const instalment = this.formula.instalmentOf({
      amount,
      months,
      nominalRate: facts.rateBasisPoints / BASIS_POINTS_PER_UNIT,
    });

    const rate = this.formula.annualPercentageRateOf({
      netCredit: Money.ofCents(amount.cents - arrangementFee.cents),
      instalment,
      monthlyFee: Money.ofCents(0),
      months,
      firstInstalmentAfter: { months: 1, days: 0 },
    });

    return {
      applicationId: facts.applicationId,
      amountCents: amount.cents,
      durationMonths: months,
      rateBasisPoints: facts.rateBasisPoints,
      annualPercentageRateTenths: rate.tenths,
      instalmentCents: instalment.cents,
      arrangementFeeCents: arrangementFee.cents,
      legalMaximumBasisPoints: facts.legalMaximumBasisPoints,
    };
  }
}
