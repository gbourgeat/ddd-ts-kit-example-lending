import { NamedDomainEvent } from '@ddd-ts-kit/kernel';
import type { RiskLevel } from '@/contexts/credit-scoring/domain/vocabularies/risk-level.vocabulary';

export class ScoringModelPublished extends NamedDomainEvent('credit-scoring.scoring-model.published') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    readonly versionId: string,
    readonly number: number,
    readonly modelRisk: RiskLevel,
    readonly label: string,
  ) {
    super();
  }
}
