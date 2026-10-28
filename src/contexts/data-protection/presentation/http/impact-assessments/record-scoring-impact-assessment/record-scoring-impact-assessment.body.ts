import { IsString } from 'class-validator';

export class RecordScoringImpactAssessmentBody {
  /** The identifier of the scoring model version the impact assessment assesses. */
  @IsString()
  scoringModelVersion = '';

  /** The month the impact assessment is for, written YYYY-MM. */
  @IsString()
  month = '';
}
