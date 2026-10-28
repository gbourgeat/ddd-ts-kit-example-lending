import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class UnknownBrokerRegistration extends DomainRefusal {
  readonly code = CreditApplicationCodes.UnknownBrokerRegistration;

  static forUnknownBrokerRegistration() {
    return UnknownBrokerRegistration.refusal('Unknown broker registration.');
  }
}
