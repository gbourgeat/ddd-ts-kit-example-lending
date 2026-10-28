import { ValueObject } from '@ddd-ts-kit/kernel';
import { InvalidScore } from '@/contexts/credit-scoring/domain/errors/invalid-score.error';
import { Band } from '@/contexts/credit-scoring/domain/vocabularies/band.vocabulary';

const LOWEST_SCORE = 0;
const HIGHEST_SCORE = 100;
const RED_BELOW = 40;
const GREEN_FROM = 70;

export type ScoreProps = {
  readonly value: number;
};

export class Score extends ValueObject<ScoreProps> {
  private constructor(props: ScoreProps) {
    super(props);
  }

  static create(value: number): Score {
    if (!Number.isInteger(value) || value < LOWEST_SCORE || value > HIGHEST_SCORE) {
      throw InvalidScore.forValue(value);
    }

    return new Score({ value });
  }

  band(): Band {
    if (this.props.value < RED_BELOW) {
      return Band.Red;
    }

    if (this.props.value < GREEN_FROM) {
      return Band.Amber;
    }

    return Band.Green;
  }

  get value(): number {
    return this.props.value;
  }
}
