import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class InvalidDecisionConditions extends DomainRefusal {
  readonly code = CreditApplicationCodes.InvalidDecisionConditions;

  static forConditions() {
    return InvalidDecisionConditions.refusal(
      'An approval with conditions needs its written conditions and a lower amount, within the requested one.',
    );
  }
}
