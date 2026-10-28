import { IsIn, IsInt, IsString } from 'class-validator';
import { RiskLevel } from '@/contexts/credit-scoring/domain/vocabularies/risk-level.vocabulary';

/** The version that was published: its identifier, its number in the model, its model risk and its label. */
export class PublishedScoringModelVersion {
  /** The identifier of the published version. */
  @IsString()
  id = '';

  /** The number of the version in the model, the next integer after the previous version. */
  @IsInt()
  number = 0;

  /** The model risk the version was published with. */
  @IsIn(Object.values(RiskLevel))
  modelRisk: RiskLevel = RiskLevel.Low;

  /** The name of the version, for example 2026.1. */
  @IsString()
  label = '';
}
