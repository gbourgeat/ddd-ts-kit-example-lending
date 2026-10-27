import { ValueObject } from '@ddd-ts-kit/kernel';
import { InvalidAnnualPercentageRate } from '@/contexts/credit-application/offer/domain/errors/invalid-annual-percentage-rate.error';

const TENTHS_PER_PERCENT = 10;

export type AnnualPercentageRateProps = {
  readonly tenths: number;
};

/**
 * An annual percentage rate held in whole tenths of a per cent: the directive states it to one decimal,
 * so no floating point is kept (51 tenths is 5.1 per cent).
 */
export class AnnualPercentageRate extends ValueObject<AnnualPercentageRateProps> {
  private constructor(props: AnnualPercentageRateProps) {
    super(props);
  }

  static ofTenths(tenths: number): AnnualPercentageRate {
    if (!Number.isSafeInteger(tenths) || tenths < 0) {
      throw InvalidAnnualPercentageRate.forValue(tenths);
    }

    return new AnnualPercentageRate({ tenths });
  }

  get tenths(): number {
    return this.props.tenths;
  }

  /** The rate as the offer states it, one decimal: 51 tenths is "5.1". */
  get percent(): string {
    const whole = Math.trunc(this.props.tenths / TENTHS_PER_PERCENT);
    const tenth = this.props.tenths % TENTHS_PER_PERCENT;

    return `${whole}.${tenth}`;
  }
}
