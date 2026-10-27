import { ValueObject } from '@ddd-ts-kit/kernel';
import { ProductBoundsInverted } from '@/contexts/credit-policy/domain/errors/product-bounds-inverted.error';

export type AmountBoundsProps = {
  readonly minimumCents: number;
  readonly maximumCents: number;
};

/** The smallest and the largest amount a product lends, in cents: the minimum is not above the maximum. */
export class AmountBounds extends ValueObject<AmountBoundsProps> {
  private constructor(props: AmountBoundsProps) {
    super(props);
  }

  static create(minimumCents: number, maximumCents: number): AmountBounds {
    if (minimumCents > maximumCents) {
      throw ProductBoundsInverted.onAmount(minimumCents, maximumCents);
    }

    return new AmountBounds({ minimumCents, maximumCents });
  }

  get minimumCents(): number {
    return this.props.minimumCents;
  }

  get maximumCents(): number {
    return this.props.maximumCents;
  }
}
