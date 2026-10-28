import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditScoringCodes } from '@/contexts/credit-scoring/credit-scoring.codes';

export class InvalidScore extends DomainRefusal {
  readonly code = CreditScoringCodes.InvalidScore;

  static forValue(value: number) {
    return InvalidScore.refusal('A score is a whole number from 0 to 100.', { value });
  }
}
