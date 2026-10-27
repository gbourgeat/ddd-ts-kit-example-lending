import { ValueObject } from '@ddd-ts-kit/kernel';
import type { AmountBounds } from '@/contexts/credit-policy/domain/value-objects/amount-bounds.vo';
import type { ArrangementFee } from '@/contexts/credit-policy/domain/value-objects/arrangement-fee.vo';
import type { DurationBounds } from '@/contexts/credit-policy/domain/value-objects/duration-bounds.vo';
import type { ScoreThreshold } from '@/contexts/credit-policy/domain/value-objects/score-threshold.vo';

export type ProductTermsProps = {
  readonly amount: AmountBounds;
  readonly duration: DurationBounds;
  readonly arrangementFee: ArrangementFee;
  readonly insuranceMandatory: boolean;
  readonly scoreThreshold: ScoreThreshold;
};

/** The conditions a product is sold with: its amounts, durations, arrangement fee, insurance and score threshold. */
export class ProductTerms extends ValueObject<ProductTermsProps> {
  private constructor(props: ProductTermsProps) {
    super(props);
  }

  static create(props: ProductTermsProps): ProductTerms {
    return new ProductTerms(props);
  }

  get amount(): AmountBounds {
    return this.props.amount;
  }

  get duration(): DurationBounds {
    return this.props.duration;
  }

  get arrangementFee(): ArrangementFee {
    return this.props.arrangementFee;
  }

  get insuranceMandatory(): boolean {
    return this.props.insuranceMandatory;
  }

  get scoreThreshold(): ScoreThreshold {
    return this.props.scoreThreshold;
  }
}
