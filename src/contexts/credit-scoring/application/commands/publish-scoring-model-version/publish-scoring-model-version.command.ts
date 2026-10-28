import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';
import type { ScoringModelVersion } from '@/contexts/credit-scoring/domain/entities/scoring-model-version.entity';
import type { RiskLevel } from '@/contexts/credit-scoring/domain/vocabularies/risk-level.vocabulary';

export class PublishScoringModelVersionCommand extends AuthorizedCommand<ScoringModelVersion> {
  constructor(
    actor: Actor,
    readonly modelRisk: RiskLevel,
    readonly label: string,
  ) {
    super(actor);
  }
}
