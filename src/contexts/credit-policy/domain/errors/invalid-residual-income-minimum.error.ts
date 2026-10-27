import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditPolicyCodes } from '@/contexts/credit-policy/credit-policy.codes';

export class InvalidResidualIncomeMinimum extends DomainRefusal {
  readonly code = CreditPolicyCodes.InvalidResidualIncomeMinimum;

  static forCents(cents: number) {
    return InvalidResidualIncomeMinimum.refusal('A residual income minimum is a positive, whole amount of cents.', {
      cents,
    }).exposing('cents');
  }
}
