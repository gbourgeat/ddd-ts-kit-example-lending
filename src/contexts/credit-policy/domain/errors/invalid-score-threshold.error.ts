import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditPolicyCodes } from '@/contexts/credit-policy/credit-policy.codes';

export class InvalidScoreThreshold extends DomainRefusal {
  readonly code = CreditPolicyCodes.InvalidScoreThreshold;

  static forScore(score: number) {
    return InvalidScoreThreshold.refusal('A score threshold is a whole score from 0 to 1000.', { score }).exposing(
      'score',
    );
  }
}
