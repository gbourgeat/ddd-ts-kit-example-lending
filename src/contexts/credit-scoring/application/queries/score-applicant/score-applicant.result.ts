import type { Band } from '@/contexts/credit-scoring/domain/vocabularies/band.vocabulary';

export interface ScoreApplicantResult {
  readonly score: number;
  readonly band: Band;
  /** The label of the model version that scored the applicant. */
  readonly modelVersion: string;
  readonly inputs: {
    readonly debtToIncomePercent: number;
    readonly repaymentIncidents: number;
    readonly residualIncomeCents: number;
  };
  /** The main factors that lowered the score, in words a customer understands, the most harmful first. */
  readonly factors: readonly string[];
}
