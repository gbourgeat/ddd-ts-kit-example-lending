import { AggregateRoot } from '@ddd-ts-kit/kernel';
import { ProductDefined } from '@/contexts/credit-policy/domain/events/product-defined.event';

export interface ProductState {
  readonly registeredAt: Date;
  readonly scoreThreshold: number;
}

export class Product extends AggregateRoot<string> {
  private constructor(
    id: string,
    private state: ProductState,
  ) {
    super(id);
  }

  static create(id: string, scoreThreshold: number, now: Date): Product {
    const created = new Product(id, { registeredAt: now, scoreThreshold });

    created.record(new ProductDefined(id, now));

    return created;
  }

  static rehydrate(id: string, state: ProductState): Product {
    return new Product(id, state);
  }

  get registeredAt(): Date {
    return this.state.registeredAt;
  }

  get scoreThreshold(): number {
    return this.state.scoreThreshold;
  }

  toState(): ProductState {
    return { ...this.state };
  }
}
