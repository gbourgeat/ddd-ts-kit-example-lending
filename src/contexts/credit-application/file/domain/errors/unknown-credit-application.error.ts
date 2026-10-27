import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class UnknownCreditApplication extends DomainRefusal {
  readonly code = CreditApplicationCodes.UnknownCreditApplication;

  static forCreditApplication(id: string) {
    return UnknownCreditApplication.refusal('Unknown credit application.', { id });
  }
}
