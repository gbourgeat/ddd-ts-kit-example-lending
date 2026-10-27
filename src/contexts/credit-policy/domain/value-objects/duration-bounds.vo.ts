import { ValueObject } from '@ddd-ts-kit/kernel';
import { ProductBoundsInverted } from '@/contexts/credit-policy/domain/errors/product-bounds-inverted.error';

export type DurationBoundsProps = {
  readonly minimumMonths: number;
  readonly maximumMonths: number;
};

/** The shortest and the longest duration a product lends, in months: the minimum is not above the maximum. */
export class DurationBounds extends ValueObject<DurationBoundsProps> {
  private constructor(props: DurationBoundsProps) {
    super(props);
  }

  static create(minimumMonths: number, maximumMonths: number): DurationBounds {
    if (minimumMonths > maximumMonths) {
      throw ProductBoundsInverted.onDuration(minimumMonths, maximumMonths);
    }

    return new DurationBounds({ minimumMonths, maximumMonths });
  }

  get minimumMonths(): number {
    return this.props.minimumMonths;
  }

  get maximumMonths(): number {
    return this.props.maximumMonths;
  }
}
