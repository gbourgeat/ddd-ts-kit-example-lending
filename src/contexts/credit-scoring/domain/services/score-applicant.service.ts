import type { Factor } from '@/contexts/credit-scoring/domain/value-objects/factor.vo';

const MOST_FACTORS_LISTED = 5;

export class ScoreApplicantService {
  mainFactors(loweringFactors: readonly Factor[]): readonly Factor[] {
    return [...loweringFactors].sort((first, second) => second.harm - first.harm).slice(0, MOST_FACTORS_LISTED);
  }
}
