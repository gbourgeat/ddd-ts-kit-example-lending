import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditPolicyCodes } from '@/contexts/credit-policy/credit-policy.codes';

export class InvalidArrangementFee extends DomainRefusal {
  readonly code = CreditPolicyCodes.InvalidArrangementFee;

  static forCents(cents: number) {
    return InvalidArrangementFee.refusal('An arrangement fee is a whole, non-negative amount of cents.', {
      cents,
    }).exposing('cents');
  }
}
