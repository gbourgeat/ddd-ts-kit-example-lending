import { Repository } from '@ddd-ts-kit/kernel';
import type { Product } from '@/contexts/credit-policy/domain/aggregates/product.aggregate';

export abstract class ProductRepository extends Repository<Product> {}
