import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

export class BrokerRegistrationLapsed extends DomainRefusal {
  readonly code = CreditApplicationCodes.BrokerRegistrationLapsed;

  static forBroker(brokerId: string) {
    return BrokerRegistrationLapsed.refusal(
      'The registration of the broker lapsed: the broker may not bring an application.',
      { brokerId },
    ).exposing('brokerId');
  }
}
