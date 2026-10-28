import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditScoringCodes } from '@/contexts/credit-scoring/credit-scoring.codes';

export class InvalidApplicantInput extends DomainRefusal {
  readonly code = CreditScoringCodes.InvalidApplicantInput;

  static forInput(input: string, value: number) {
    return InvalidApplicantInput.refusal(
      'An applicant input is a whole number: the debt ratio and the repayment incidents are not negative.',
      { input, value },
    );
  }
}
