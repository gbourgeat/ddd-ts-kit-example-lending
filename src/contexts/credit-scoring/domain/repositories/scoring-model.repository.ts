import { Repository } from '@ddd-ts-kit/kernel';
import type { ScoringModel } from '@/contexts/credit-scoring/domain/aggregates/scoring-model.aggregate';

export abstract class ScoringModelRepository extends Repository<ScoringModel> {}
