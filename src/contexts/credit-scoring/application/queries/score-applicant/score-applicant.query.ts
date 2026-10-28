import { AuthorizedQuery, type Actor } from '@ddd-ts-kit/kernel';
import type { ScoreApplicantResult } from '@/contexts/credit-scoring/application/queries/score-applicant/score-applicant.result';

export class ScoreApplicantQuery extends AuthorizedQuery<ScoreApplicantResult> {
  constructor(
    actor: Actor,
    readonly inputs: {
      readonly debtToIncomePercent: number;
      readonly repaymentIncidents: number;
      readonly residualIncomeCents: number;
    },
    /** The label of the published model version to score with, for example 2026.1. */
    readonly modelVersion: string,
  ) {
    super(actor);
  }
}
