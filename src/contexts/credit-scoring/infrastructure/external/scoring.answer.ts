import type { ScoringContract } from '@/contexts/credit-scoring/published-language/scoring.contract';
import { ScoringModel } from '@/contexts/credit-scoring/domain/aggregates/scoring-model.aggregate';
import type { ScoringModelRepository } from '@/contexts/credit-scoring/domain/repositories/scoring-model.repository';
import { ScoreApplicantService } from '@/contexts/credit-scoring/domain/services/score-applicant.service';
import { ApplicantInputs } from '@/contexts/credit-scoring/domain/value-objects/applicant-inputs.vo';

/** Scores an applicant with the latest published version of the bank's scoring model. */
export class ScoringAnswer implements ScoringContract {
  constructor(private readonly scoringModelRepository: ScoringModelRepository) {}

  async scoreOf(inputs: {
    debtToIncomePercent: number;
    repaymentIncidents: number;
    residualIncomeCents: number;
  }): Promise<{ score: number; band: string; modelVersion: string; factors: string[] } | undefined> {
    const scoringModel = await this.scoringModelRepository.findById(ScoringModel.BANK_ID);
    const latest = scoringModel?.versions.at(-1);

    if (latest === undefined) {
      return undefined;
    }

    const applicant = ApplicantInputs.create(
      inputs.debtToIncomePercent,
      inputs.repaymentIncidents,
      inputs.residualIncomeCents,
    );

    const scoring = new ScoreApplicantService().score(applicant);

    return {
      score: scoring.score.value,
      band: scoring.band(),
      modelVersion: latest.label,
      factors: scoring.factors.map((factor) => factor.words),
    };
  }
}
