import { Builder, sequence, type Defaults } from '@ddd-ts-kit/testing';
import { ScoringModel } from '@/contexts/credit-scoring/domain/aggregates/scoring-model.aggregate';

interface ScoringModelIngredients {
  readonly id: string;
  readonly bornAt: Date;
}

export class ScoringModelBuilder extends Builder<ScoringModelIngredients, ScoringModel> {
  identifiedBy(id: string): this {
    return this.with('id', id);
  }

  bornAt(instant: Date): this {
    return this.with('bornAt', instant);
  }

  protected defaults(): Defaults<ScoringModelIngredients> {
    return { id: sequence('scoring-model'), bornAt: new Date('2026-01-01T00:00:00.000Z') };
  }

  protected construct(ingredients: ScoringModelIngredients): ScoringModel {
    return ScoringModel.create(ingredients.id, ingredients.bornAt);
  }
}

export function aScoringModel(): ScoringModelBuilder {
  return new ScoringModelBuilder();
}
