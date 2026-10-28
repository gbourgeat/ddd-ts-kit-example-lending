import { ValueObject } from '@ddd-ts-kit/kernel';
import { InvalidApplicantInput } from '@/contexts/credit-scoring/domain/errors/invalid-applicant-input.error';

export type ApplicantInputsProps = {
  /** The debts of the applicant as a percentage of the income, a whole number. */
  readonly debtToIncomePercent: number;
  /** The repayment incidents registered in the name of the applicant, never negative. */
  readonly repaymentIncidents: number;
  /** The income left after the costs of the applicant, in cents, a whole number that may be negative. */
  readonly residualIncomeCents: number;
};

export class ApplicantInputs extends ValueObject<ApplicantInputsProps> {
  private constructor(props: ApplicantInputsProps) {
    super(props);
  }

  static create(debtToIncomePercent: number, repaymentIncidents: number, residualIncomeCents: number): ApplicantInputs {
    if (!Number.isInteger(debtToIncomePercent) || debtToIncomePercent < 0) {
      throw InvalidApplicantInput.forInput('debtToIncomePercent', debtToIncomePercent);
    }

    if (!Number.isInteger(repaymentIncidents) || repaymentIncidents < 0) {
      throw InvalidApplicantInput.forInput('repaymentIncidents', repaymentIncidents);
    }

    if (!Number.isInteger(residualIncomeCents)) {
      throw InvalidApplicantInput.forInput('residualIncomeCents', residualIncomeCents);
    }

    return new ApplicantInputs({ debtToIncomePercent, repaymentIncidents, residualIncomeCents });
  }

  get debtToIncomePercent(): number {
    return this.props.debtToIncomePercent;
  }

  get repaymentIncidents(): number {
    return this.props.repaymentIncidents;
  }

  get residualIncomeCents(): number {
    return this.props.residualIncomeCents;
  }
}
