import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class ExceptionAlreadyDecided extends DomainRefusal {
  readonly code = CreditApplicationCodes.ExceptionAlreadyDecided;

  static forExceptionAlreadyDecided() {
    return ExceptionAlreadyDecided.refusal('The committee already decided the exception requested on the application.');
  }
}
