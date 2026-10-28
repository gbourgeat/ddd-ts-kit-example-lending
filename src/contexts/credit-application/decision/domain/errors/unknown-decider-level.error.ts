import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class UnknownDeciderLevel extends DomainRefusal {
  readonly code = CreditApplicationCodes.UnknownDeciderLevel;

  static forUnknownDeciderLevel() {
    return UnknownDeciderLevel.refusal('Unknown decider level.');
  }
}
