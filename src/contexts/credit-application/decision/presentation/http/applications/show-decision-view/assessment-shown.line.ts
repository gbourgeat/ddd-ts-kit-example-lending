import { IsArray, IsInt, IsString } from 'class-validator';

/** The assessment the decider saw: what it rests on, the outcome it proposed, and who ran it. */
export class AssessmentShownLine {
  @IsString()
  assessorId = '';

  /** The instant of the assessment, ISO 8601. */
  @IsString()
  assessedAt = '';

  @IsString()
  modelVersion = '';

  @IsInt()
  debtToIncomePercent = 0;

  @IsInt()
  repaymentIncidents = 0;

  @IsInt()
  residualIncomeCents = 0;

  @IsInt()
  score = 0;

  @IsString()
  band = '';

  @IsArray()
  @IsString({ each: true })
  factors: string[] = [];

  @IsString()
  proposedOutcome = '';
}
