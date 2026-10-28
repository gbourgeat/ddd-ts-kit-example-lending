import { Builder, sequence, type Defaults } from '@ddd-ts-kit/testing';
import { RateGrid } from '@/contexts/credit-policy/domain/aggregates/rate-grid.aggregate';

interface RateGridIngredients {
  readonly id: string;
  readonly bornAt: Date;
  readonly productId: string;
  readonly effectiveFrom: Date;
}

export class RateGridBuilder extends Builder<RateGridIngredients, RateGrid> {
  identifiedBy(id: string): this {
    return this.with('id', id);
  }

  bornAt(instant: Date): this {
    return this.with('bornAt', instant);
  }

  ofProduct(productId: string): this {
    return this.with('productId', productId);
  }

  takingEffectOn(effectiveFrom: Date): this {
    return this.with('effectiveFrom', effectiveFrom);
  }

  protected defaults(): Defaults<RateGridIngredients> {
    return {
      id: sequence('rate-grid'),
      bornAt: new Date('2026-01-01T00:00:00.000Z'),
      productId: 'product-1',
      effectiveFrom: new Date('2026-01-01T00:00:00.000Z'),
    };
  }

  protected construct(ingredients: RateGridIngredients): RateGrid {
    return RateGrid.create(
      ingredients.id,
      { productId: ingredients.productId, effectiveFrom: ingredients.effectiveFrom, rates: [] },
      ingredients.bornAt,
    );
  }
}

export function aRateGrid(): RateGridBuilder {
  return new RateGridBuilder();
}
