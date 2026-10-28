import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class ExceptionNotAboveLimit extends DomainRefusal {
  readonly code = CreditApplicationCodes.ExceptionNotAboveLimit;

  static forExceptionNotAboveLimit(deciderLevel: string) {
    return ExceptionNotAboveLimit.refusal(
      "The amount is within the decider's limit: no exception is needed, the decider decides it.",
      { deciderLevel },
    ).exposing('deciderLevel');
  }
}
