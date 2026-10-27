import { Repository } from '@ddd-ts-kit/kernel';
import type { RateGrid } from '@/contexts/credit-policy/domain/aggregates/rate-grid.aggregate';

export abstract class RateGridRepository extends Repository<RateGrid> {}
