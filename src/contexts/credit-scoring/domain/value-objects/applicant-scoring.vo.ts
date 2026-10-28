import { ValueObject } from '@ddd-ts-kit/kernel';
import type { Band } from '@/contexts/credit-scoring/domain/vocabularies/band.vocabulary';
import type { Factor } from '@/contexts/credit-scoring/domain/value-objects/factor.vo';
import type { Score } from '@/contexts/credit-scoring/domain/value-objects/score.vo';

export type ApplicantScoringProps = {
  readonly score: Score;
  /** The factors that pushed the score down, the most harmful first, in words a customer understands. */
  readonly factors: readonly Factor[];
};

/** The score of an applicant with the main factors that lowered it. */
export class ApplicantScoring extends ValueObject<ApplicantScoringProps> {
  private constructor(props: ApplicantScoringProps) {
    super(props);
  }

  static create(score: Score, factors: readonly Factor[]): ApplicantScoring {
    return new ApplicantScoring({ score, factors: [...factors] });
  }

  band(): Band {
    return this.props.score.band();
  }

  get score(): Score {
    return this.props.score;
  }

  get factors(): readonly Factor[] {
    return [...this.props.factors];
  }
}
