import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { BrokerageCodes } from '@/contexts/brokerage/brokerage.codes';

export class InvalidBrokerRegistration extends DomainRefusal {
  readonly code = BrokerageCodes.InvalidBrokerRegistration;

  static forRegistration(registrationNumber: string) {
    return InvalidBrokerRegistration.refusal(
      `The registration ${registrationNumber} is not valid on the day of the application.`,
      { registrationNumber },
    ).exposing('registrationNumber');
  }
}
