import { ValueObject } from '@ddd-ts-kit/kernel';
import { InvalidScoreThreshold } from '@/contexts/credit-policy/domain/errors/invalid-score-threshold.error';

const LOWEST_SCORE = 0;
const HIGHEST_SCORE = 1000;

export type ScoreThresholdProps = {
  readonly score: number;
};

/** The lowest score a product accepts without an exception: a whole score from 0 to 1000. */
export class ScoreThreshold extends ValueObject<ScoreThresholdProps> {
  private constructor(props: ScoreThresholdProps) {
    super(props);
  }

  static create(score: number): ScoreThreshold {
    if (!Number.isInteger(score) || score < LOWEST_SCORE || score > HIGHEST_SCORE) {
      throw InvalidScoreThreshold.forScore(score);
    }

    return new ScoreThreshold({ score });
  }

  get score(): number {
    return this.props.score;
  }
}
