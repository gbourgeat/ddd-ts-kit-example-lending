import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class ExceptionNotAboveLimit extends DomainRefusal {
  readonly code = CreditApplicationCodes.ExceptionNotAboveLimit;

  static forExceptionNotAboveLimit() {
    // TODO(domain): take as parameters what `forExceptionNotAboveLimit` names and the facts that explain the refusal (which credit application rule, which value), give them as the second argument and write a message a domain expert would recognise; a fact reaches the client only when named: `.exposing('<fact>')`. The code is the stable contract.
    return ExceptionNotAboveLimit.refusal('Exception not above limit.');
  }
}
