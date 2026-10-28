import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class NotAssessed extends DomainRefusal {
  readonly code = CreditApplicationCodes.NotAssessed;

  static forNotAssessed() {
    return NotAssessed.refusal('The application was not assessed: it cannot be decided before its assessment.');
  }
}
