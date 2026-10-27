import { Builder, sequence, type Defaults } from '@ddd-ts-kit/testing';
import { Product } from '@/contexts/credit-policy/domain/aggregates/product.aggregate';
import { AmountBounds } from '@/contexts/credit-policy/domain/value-objects/amount-bounds.vo';
import { ArrangementFee } from '@/contexts/credit-policy/domain/value-objects/arrangement-fee.vo';
import { DurationBounds } from '@/contexts/credit-policy/domain/value-objects/duration-bounds.vo';
import { ProductTerms } from '@/contexts/credit-policy/domain/value-objects/product-terms.vo';
import { ScoreThreshold } from '@/contexts/credit-policy/domain/value-objects/score-threshold.vo';

interface ProductIngredients {
  readonly id: string;
  readonly bornAt: Date;
  readonly amountMinimumCents: number;
  readonly amountMaximumCents: number;
  readonly durationMinimumMonths: number;
  readonly durationMaximumMonths: number;
  readonly arrangementFeeCents: number;
  readonly insuranceMandatory: boolean;
  readonly scoreThreshold: number;
}

export class ProductBuilder extends Builder<ProductIngredients, Product> {
  identifiedBy(id: string): this {
    return this.with('id', id);
  }

  bornAt(instant: Date): this {
    return this.with('bornAt', instant);
  }

  threshold(scoreThreshold: number): this {
    return this.with('scoreThreshold', scoreThreshold);
  }

  insuranceMandatory(insuranceMandatory: boolean): this {
    return this.with('insuranceMandatory', insuranceMandatory);
  }

  protected defaults(): Defaults<ProductIngredients> {
    return {
      id: sequence('product'),
      bornAt: new Date('2026-01-01T00:00:00.000Z'),
      amountMinimumCents: 100_000,
      amountMaximumCents: 2_500_000,
      durationMinimumMonths: 12,
      durationMaximumMonths: 84,
      arrangementFeeCents: 4_500,
      insuranceMandatory: false,
      scoreThreshold: 600,
    };
  }

  protected construct(ingredients: ProductIngredients): Product {
    const terms = ProductTerms.create({
      amount: AmountBounds.create(ingredients.amountMinimumCents, ingredients.amountMaximumCents),
      duration: DurationBounds.create(ingredients.durationMinimumMonths, ingredients.durationMaximumMonths),
      arrangementFee: ArrangementFee.create(ingredients.arrangementFeeCents),
      insuranceMandatory: ingredients.insuranceMandatory,
      scoreThreshold: ScoreThreshold.create(ingredients.scoreThreshold),
    });

    return Product.create(ingredients.id, terms, ingredients.bornAt);
  }
}

export function aProduct(): ProductBuilder {
  return new ProductBuilder();
}
