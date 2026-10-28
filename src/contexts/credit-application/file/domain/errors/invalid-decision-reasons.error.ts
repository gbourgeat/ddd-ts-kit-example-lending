import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class InvalidDecisionReasons extends DomainRefusal {
  readonly code = CreditApplicationCodes.InvalidDecisionReasons;

  static forReasons() {
    return InvalidDecisionReasons.refusal('A refusal needs its written reasons.');
  }
}
