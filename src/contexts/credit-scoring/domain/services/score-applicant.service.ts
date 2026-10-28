import { ApplicantFactorsService } from '@/contexts/credit-scoring/domain/services/applicant-factors.service';
import { ApplicantScoring } from '@/contexts/credit-scoring/domain/value-objects/applicant-scoring.vo';
import type { ApplicantInputs } from '@/contexts/credit-scoring/domain/value-objects/applicant-inputs.vo';
import type { Factor } from '@/contexts/credit-scoring/domain/value-objects/factor.vo';
import { Score } from '@/contexts/credit-scoring/domain/value-objects/score.vo';

const MOST_FACTORS_LISTED = 5;
/** An applicant starts at the full score, and each factor takes its harm off it. */
const FULL_SCORE = 100;
const LOWEST_SCORE = 0;

export class ScoreApplicantService {
  /** Scores an applicant from the inputs of the model: the score, its band and the main factors in words. */
  score(inputs: ApplicantInputs): ApplicantScoring {
    const factors = new ApplicantFactorsService().loweringFactorsOf(inputs);
    const totalHarm = factors.reduce((total, factor) => total + factor.harm, 0);
    const score = Score.create(Math.max(LOWEST_SCORE, FULL_SCORE - totalHarm));

    return ApplicantScoring.create(score, this.mainFactors(factors));
  }

  mainFactors(loweringFactors: readonly Factor[]): readonly Factor[] {
    return [...loweringFactors].sort((first, second) => second.harm - first.harm).slice(0, MOST_FACTORS_LISTED);
  }
}
