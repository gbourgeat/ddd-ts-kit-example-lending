import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class ExceptionAlreadyRequested extends DomainRefusal {
  readonly code = CreditApplicationCodes.ExceptionAlreadyRequested;

  static forExceptionAlreadyRequested() {
    return ExceptionAlreadyRequested.refusal(
      'An exception is already requested on this application: one at a time, until the level above answers.',
    );
  }
}
