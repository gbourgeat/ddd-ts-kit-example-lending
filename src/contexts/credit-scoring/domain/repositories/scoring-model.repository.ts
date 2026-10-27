import { Repository } from '@ddd-ts-kit/kernel';
import type { ScoringModel } from '@/contexts/credit-scoring/domain/aggregates/scoring-model.aggregate';

export abstract class ScoringModelRepository extends Repository<ScoringModel> {
  // TODO(domain): add only the lookups a use case needs, as abstract methods named in the ubiquitous language (for example `abstract findByNumber(number: InvoiceNumber): Promise<ScoringModel | undefined>`); queries for screens go through a read port instead.
}
