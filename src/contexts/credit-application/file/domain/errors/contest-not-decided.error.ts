import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class ContestNotDecided extends DomainRefusal {
  readonly code = CreditApplicationCodes.ContestNotDecided;

  static forContestNotDecided() {
    return ContestNotDecided.refusal('The application has no decision yet: there is nothing to contest.');
  }
}
