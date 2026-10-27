import { ValueObject } from '@ddd-ts-kit/kernel';
import { InvalidLegalMaximumRate } from '@/contexts/credit-policy/domain/errors/invalid-legal-maximum-rate.error';

export type LegalMaximumRateTermsProps = {
  readonly category: string;
  readonly rateBasisPoints: number;
  readonly effectiveFrom: Date;
};

const LOAN_CATEGORIES: readonly string[] = ['personal', 'car', 'term'];

/** The legal maximum rate of a category of loan: a whole number of basis points of a year, from its day of effect. */
export class LegalMaximumRateTerms extends ValueObject<LegalMaximumRateTermsProps> {
  private constructor(props: LegalMaximumRateTermsProps) {
    super(props);
  }

  static create(props: LegalMaximumRateTermsProps): LegalMaximumRateTerms {
    if (!LOAN_CATEGORIES.includes(props.category)) {
      throw InvalidLegalMaximumRate.forCategory(props.category);
    }

    if (!Number.isInteger(props.rateBasisPoints) || props.rateBasisPoints < 0) {
      throw InvalidLegalMaximumRate.forBasisPoints(props.rateBasisPoints);
    }

    return new LegalMaximumRateTerms(props);
  }

  get category(): string {
    return this.props.category;
  }

  get rateBasisPoints(): number {
    return this.props.rateBasisPoints;
  }

  get effectiveFrom(): Date {
    return this.props.effectiveFrom;
  }
}
