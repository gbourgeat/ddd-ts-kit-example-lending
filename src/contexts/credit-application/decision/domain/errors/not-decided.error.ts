import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class NotDecided extends DomainRefusal {
  readonly code = CreditApplicationCodes.NotDecided;

  static forNotDecided() {
    return NotDecided.refusal('The application has no decision yet: there is nothing the decider saw to show.');
  }
}
