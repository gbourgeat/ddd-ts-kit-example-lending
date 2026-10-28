import { IsInt, IsString, Min } from 'class-validator';

export class ScoreApplicantBody {
  /** The debts of the applicant as a percentage of the income, a whole number. */
  @IsInt()
  debtToIncomePercent = 0;

  /** The repayment incidents registered in the name of the applicant. */
  @IsInt()
  @Min(0)
  repaymentIncidents = 0;

  /** The income left after the costs of the applicant, in cents. */
  @IsInt()
  residualIncomeCents = 0;

  /** The label of the published model version to score with, for example 2026.1. */
  @IsString()
  modelVersion = '';
}
