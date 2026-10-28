import { IsIn, IsString } from 'class-validator';
import { RiskLevel } from '@/contexts/credit-scoring/domain/vocabularies/risk-level.vocabulary';

export class PublishScoringModelVersionBody {
  /** The model risk of the version: how much the model itself is a risk for the bank. */
  @IsIn(Object.values(RiskLevel))
  modelRisk: RiskLevel = RiskLevel.Low;

  /** The name of the version, for example 2026.1. A blank name is refused by the domain. */
  @IsString()
  label = '';
}
