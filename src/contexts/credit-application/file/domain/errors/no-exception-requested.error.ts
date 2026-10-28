import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class NoExceptionRequested extends DomainRefusal {
  readonly code = CreditApplicationCodes.NoExceptionRequested;

  static forNoExceptionRequested() {
    return NoExceptionRequested.refusal('No exception is requested on the application: there is nothing to decide.');
  }
}
