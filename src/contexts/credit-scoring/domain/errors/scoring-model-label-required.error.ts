import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditScoringCodes } from '@/contexts/credit-scoring/credit-scoring.codes';

export class ScoringModelLabelRequired extends DomainRefusal {
  readonly code = CreditScoringCodes.ScoringModelLabelRequired;

  static forLabel() {
    return ScoringModelLabelRequired.refusal('Scoring model label required.');
  }
}
