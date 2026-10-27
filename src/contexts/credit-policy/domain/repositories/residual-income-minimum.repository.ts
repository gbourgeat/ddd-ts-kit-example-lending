import { Repository } from '@ddd-ts-kit/kernel';
import type { ResidualIncomeMinimum } from '@/contexts/credit-policy/domain/aggregates/residual-income-minimum.aggregate';

export abstract class ResidualIncomeMinimumRepository extends Repository<ResidualIncomeMinimum> {}
