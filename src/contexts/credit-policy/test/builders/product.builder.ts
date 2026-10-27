import { Builder, sequence, type Defaults } from '@ddd-ts-kit/testing';
import { Product } from '@/contexts/credit-policy/domain/aggregates/product.aggregate';

interface ProductIngredients {
  readonly id: string;
  readonly bornAt: Date;
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

  protected defaults(): Defaults<ProductIngredients> {
    return {
      id: sequence('product'),
      bornAt: new Date('2026-01-01T00:00:00.000Z'),
      scoreThreshold: 600,
    };
  }

  protected construct(ingredients: ProductIngredients): Product {
    return Product.create(ingredients.id, ingredients.scoreThreshold, ingredients.bornAt);
  }
}

export function aProduct(): ProductBuilder {
  return new ProductBuilder();
}
