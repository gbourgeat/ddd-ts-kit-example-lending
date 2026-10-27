import { ValueObject } from '@ddd-ts-kit/kernel';
import { InvalidArrangementFee } from '@/contexts/credit-policy/domain/errors/invalid-arrangement-fee.error';

export type ArrangementFeeProps = {
  readonly cents: number;
};

/** The one-off arrangement fee of a product: a whole, non-negative amount of cents. */
export class ArrangementFee extends ValueObject<ArrangementFeeProps> {
  private constructor(props: ArrangementFeeProps) {
    super(props);
  }

  static create(cents: number): ArrangementFee {
    if (!Number.isInteger(cents) || cents < 0) {
      throw InvalidArrangementFee.forCents(cents);
    }

    return new ArrangementFee({ cents });
  }

  get cents(): number {
    return this.props.cents;
  }
}
