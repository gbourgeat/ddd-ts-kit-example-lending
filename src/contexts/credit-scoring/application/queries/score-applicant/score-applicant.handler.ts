import type { QueryHandler } from '@ddd-ts-kit/kernel';
import { ScoringModel } from '@/contexts/credit-scoring/domain/aggregates/scoring-model.aggregate';
import type { ScoreApplicantQuery } from '@/contexts/credit-scoring/application/queries/score-applicant/score-applicant.query';
import type { ScoreApplicantResult } from '@/contexts/credit-scoring/application/queries/score-applicant/score-applicant.result';
import { UnknownModelVersion } from '@/contexts/credit-scoring/domain/errors/unknown-model-version.error';
import type { ScoringModelRepository } from '@/contexts/credit-scoring/domain/repositories/scoring-model.repository';
import { ScoreApplicantService } from '@/contexts/credit-scoring/domain/services/score-applicant.service';
import { ApplicantInputs } from '@/contexts/credit-scoring/domain/value-objects/applicant-inputs.vo';

export class ScoreApplicantHandler implements QueryHandler<ScoreApplicantQuery> {
  constructor(private readonly scoringModelRepository: ScoringModelRepository) {}

  async execute(query: ScoreApplicantQuery): Promise<ScoreApplicantResult> {
    const scoringModel = await this.scoringModelRepository.findById(ScoringModel.BANK_ID);
    const version = scoringModel?.versions.find((published) => published.label === query.modelVersion);

    if (version === undefined) {
      throw UnknownModelVersion.forLabel(query.modelVersion);
    }

    const { debtToIncomePercent, repaymentIncidents, residualIncomeCents } = query.inputs;
    const inputs = ApplicantInputs.create(debtToIncomePercent, repaymentIncidents, residualIncomeCents);
    const scoring = new ScoreApplicantService().score(inputs);

    return {
      score: scoring.score.value,
      band: scoring.band(),
      modelVersion: version.label,
      inputs: { debtToIncomePercent, repaymentIncidents, residualIncomeCents },
      factors: scoring.factors.map((factor) => factor.words),
    };
  }
}
