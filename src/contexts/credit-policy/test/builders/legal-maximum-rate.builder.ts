import { Builder, sequence, type Defaults } from '@ddd-ts-kit/testing';
import { LegalMaximumRate } from '@/contexts/credit-policy/domain/aggregates/legal-maximum-rate.aggregate';
import { LegalMaximumRateTerms } from '@/contexts/credit-policy/domain/value-objects/legal-maximum-rate-terms.vo';

interface LegalMaximumRateIngredients {
  readonly id: string;
  readonly bornAt: Date;
  readonly category: string;
  readonly rateBasisPoints: number;
  readonly effectiveFrom: Date;
}

export class LegalMaximumRateBuilder extends Builder<LegalMaximumRateIngredients, LegalMaximumRate> {
  identifiedBy(id: string): this {
    return this.with('id', id);
  }

  bornAt(instant: Date): this {
    return this.with('bornAt', instant);
  }

  forCategory(category: string): this {
    return this.with('category', category);
  }

  atRate(rateBasisPoints: number): this {
    return this.with('rateBasisPoints', rateBasisPoints);
  }

  takingEffectOn(effectiveFrom: Date): this {
    return this.with('effectiveFrom', effectiveFrom);
  }

  protected defaults(): Defaults<LegalMaximumRateIngredients> {
    return {
      id: sequence('legal-maximum-rate'),
      bornAt: new Date('2026-01-01T00:00:00.000Z'),
      category: 'personal',
      rateBasisPoints: 2000,
      effectiveFrom: new Date('2026-01-01T00:00:00.000Z'),
    };
  }

  protected construct(ingredients: LegalMaximumRateIngredients): LegalMaximumRate {
    const terms = LegalMaximumRateTerms.create({
      category: ingredients.category,
      rateBasisPoints: ingredients.rateBasisPoints,
      effectiveFrom: ingredients.effectiveFrom,
    });

    return LegalMaximumRate.create(ingredients.id, terms, ingredients.bornAt);
  }
}

export function aLegalMaximumRate(): LegalMaximumRateBuilder {
  return new LegalMaximumRateBuilder();
}
