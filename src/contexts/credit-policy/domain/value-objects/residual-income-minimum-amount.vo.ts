import { ValueObject } from '@ddd-ts-kit/kernel';
import { InvalidResidualIncomeMinimum } from '@/contexts/credit-policy/domain/errors/invalid-residual-income-minimum.error';

export type ResidualIncomeMinimumAmountProps = {
  readonly cents: number;
};

/** The least amount a household keeps each month, per adult or per child: a positive, whole amount of cents. */
export class ResidualIncomeMinimumAmount extends ValueObject<ResidualIncomeMinimumAmountProps> {
  private constructor(props: ResidualIncomeMinimumAmountProps) {
    super(props);
  }

  static create(cents: number): ResidualIncomeMinimumAmount {
    if (!Number.isInteger(cents) || cents <= 0) {
      throw InvalidResidualIncomeMinimum.forCents(cents);
    }

    return new ResidualIncomeMinimumAmount({ cents });
  }

  get cents(): number {
    return this.props.cents;
  }
}
