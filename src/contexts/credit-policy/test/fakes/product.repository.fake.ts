import { InMemoryRepository, snapshots } from '@ddd-ts-kit/testing';
import { Product } from '@/contexts/credit-policy/domain/aggregates/product.aggregate';
import type { ProductRepository } from '@/contexts/credit-policy/domain/repositories/product.repository';

export class FakeProductRepository extends InMemoryRepository<Product> implements ProductRepository {
  constructor() {
    super(
      snapshots({
        toSnapshot: (stored: Product) => ({ id: stored.id, state: stored.toState() }),
        fromSnapshot: ({ id, state }) => Product.rehydrate(id, state),
      }),
    );
  }
}
