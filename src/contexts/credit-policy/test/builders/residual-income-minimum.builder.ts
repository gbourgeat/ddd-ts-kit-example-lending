import { Builder, sequence, type Defaults } from '@ddd-ts-kit/testing';
import { ResidualIncomeMinimum } from '@/contexts/credit-policy/domain/aggregates/residual-income-minimum.aggregate';

interface ResidualIncomeMinimumIngredients {
  readonly id: string;
  readonly bornAt: Date;
  readonly perAdultInCents: number;
  readonly perChildInCents: number;
  readonly effectiveFrom: Date;
}

export class ResidualIncomeMinimumBuilder extends Builder<ResidualIncomeMinimumIngredients, ResidualIncomeMinimum> {
  identifiedBy(id: string): this {
    return this.with('id', id);
  }

  bornAt(instant: Date): this {
    return this.with('bornAt', instant);
  }

  forAdultAndChild(perAdultInCents: number, perChildInCents: number): this {
    return this.with('perAdultInCents', perAdultInCents).with('perChildInCents', perChildInCents);
  }

  takingEffectOn(effectiveFrom: Date): this {
    return this.with('effectiveFrom', effectiveFrom);
  }

  protected defaults(): Defaults<ResidualIncomeMinimumIngredients> {
    return {
      id: sequence('residual-income-minimum'),
      bornAt: new Date('2026-01-01T00:00:00.000Z'),
      perAdultInCents: 80000,
      perChildInCents: 30000,
      effectiveFrom: new Date('2026-01-01T00:00:00.000Z'),
    };
  }

  protected construct(ingredients: ResidualIncomeMinimumIngredients): ResidualIncomeMinimum {
    return ResidualIncomeMinimum.create(
      ingredients.id,
      {
        perAdultInCents: ingredients.perAdultInCents,
        perChildInCents: ingredients.perChildInCents,
        effectiveFrom: ingredients.effectiveFrom,
      },
      ingredients.bornAt,
    );
  }
}

export function aResidualIncomeMinimum(): ResidualIncomeMinimumBuilder {
  return new ResidualIncomeMinimumBuilder();
}
