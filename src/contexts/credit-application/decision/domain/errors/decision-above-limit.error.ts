import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class DecisionAboveLimit extends DomainRefusal {
  readonly code = CreditApplicationCodes.DecisionAboveLimit;

  static forAboveLimit(levelNeeded: string) {
    return DecisionAboveLimit.refusal("The amount is above the decider's limit: a higher level must decide.", {
      levelNeeded,
    }).exposing('levelNeeded');
  }
}
