import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditScoringCodes } from '@/contexts/credit-scoring/credit-scoring.codes';

export class InvalidFactor extends DomainRefusal {
  readonly code = CreditScoringCodes.InvalidFactor;

  static forWords(words: string) {
    return InvalidFactor.refusal('A factor is stated in words, and the words are not empty.', { words });
  }

  static forHarm(harm: number) {
    return InvalidFactor.refusal('A factor takes at least one whole point off the score.', { harm });
  }
}
