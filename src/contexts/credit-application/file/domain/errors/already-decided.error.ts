import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class AlreadyDecided extends DomainRefusal {
  readonly code = CreditApplicationCodes.AlreadyDecided;

  static forAlreadyDecided() {
    return AlreadyDecided.refusal('The application was already decided: a decision is recorded once.');
  }
}
