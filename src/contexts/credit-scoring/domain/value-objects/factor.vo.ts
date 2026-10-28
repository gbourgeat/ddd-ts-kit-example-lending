import { ValueObject } from '@ddd-ts-kit/kernel';
import { InvalidFactor } from '@/contexts/credit-scoring/domain/errors/invalid-factor.error';

const LEAST_HARM = 1;

export type FactorProps = {
  readonly words: string;
  readonly harm: number;
};

export class Factor extends ValueObject<FactorProps> {
  private constructor(props: FactorProps) {
    super(props);
  }

  static create(words: string, harm: number): Factor {
    const stated = words.trim();

    if (stated.length === 0) {
      throw InvalidFactor.forWords(words);
    }

    if (!Number.isInteger(harm) || harm < LEAST_HARM) {
      throw InvalidFactor.forHarm(harm);
    }

    return new Factor({ words: stated, harm });
  }

  get words(): string {
    return this.props.words;
  }

  get harm(): number {
    return this.props.harm;
  }
}
