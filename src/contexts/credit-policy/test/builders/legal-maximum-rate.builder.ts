import { Builder, sequence, type Defaults } from '@ddd-ts-kit/testing';
import { LegalMaximumRate } from '@/contexts/credit-policy/domain/aggregates/legal-maximum-rate.aggregate';

interface LegalMaximumRateIngredients {
  readonly id: string;
  readonly bornAt: Date;
  readonly category: string;
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

  takingEffectOn(effectiveFrom: Date): this {
    return this.with('effectiveFrom', effectiveFrom);
  }

  protected defaults(): Defaults<LegalMaximumRateIngredients> {
    return {
      id: sequence('legal-maximum-rate'),
      bornAt: new Date('2026-01-01T00:00:00.000Z'),
      category: 'personal-loan',
      effectiveFrom: new Date('2026-01-01T00:00:00.000Z'),
    };
  }

  protected construct(ingredients: LegalMaximumRateIngredients): LegalMaximumRate {
    return LegalMaximumRate.create(ingredients.id, ingredients.category, ingredients.effectiveFrom, ingredients.bornAt);
  }
}

export function aLegalMaximumRate(): LegalMaximumRateBuilder {
  return new LegalMaximumRateBuilder();
}
