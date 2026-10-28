import { Builder, sequence, type Defaults } from '@ddd-ts-kit/testing';
import { Offer } from '@/contexts/credit-application/offer/domain/aggregates/offer.aggregate';

interface OfferIngredients {
  readonly id: string;
  readonly bornAt: Date;
  readonly annualPercentageRateTenths: number;
  readonly legalMaximumBasisPoints: number;
}

export class OfferBuilder extends Builder<OfferIngredients, Offer> {
  identifiedBy(id: string): this {
    return this.with('id', id);
  }

  bornAt(instant: Date): this {
    return this.with('bornAt', instant);
  }

  /** Priced at an annual percentage rate, in tenths of a per cent. */
  atAnnualPercentageRate(tenths: number): this {
    return this.with('annualPercentageRateTenths', tenths);
  }

  /** Under the legal maximum rate in force, in basis points of a year. */
  underMaximum(basisPoints: number): this {
    return this.with('legalMaximumBasisPoints', basisPoints);
  }

  protected defaults(): Defaults<OfferIngredients> {
    return {
      id: sequence('offer'),
      bornAt: new Date('2026-01-01T00:00:00.000Z'),
      annualPercentageRateTenths: 61,
      legalMaximumBasisPoints: 1_250,
    };
  }

  protected construct(ingredients: OfferIngredients): Offer {
    return Offer.draft(
      ingredients.id,
      {
        applicationId: 'application-1',
        amountCents: 1_000_000,
        durationMonths: 60,
        rateBasisPoints: 590,
        annualPercentageRateTenths: ingredients.annualPercentageRateTenths,
        instalmentCents: 19_286,
        arrangementFeeCents: 0,
        legalMaximumBasisPoints: ingredients.legalMaximumBasisPoints,
      },
      ingredients.bornAt,
    );
  }
}

export function anOffer(): OfferBuilder {
  return new OfferBuilder();
}
