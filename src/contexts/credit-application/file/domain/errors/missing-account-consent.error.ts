import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class MissingAccountConsent extends DomainRefusal {
  readonly code = CreditApplicationCodes.MissingAccountConsent;

  static forApplication() {
    return MissingAccountConsent.refusal('Missing account consent.');
  }
}
