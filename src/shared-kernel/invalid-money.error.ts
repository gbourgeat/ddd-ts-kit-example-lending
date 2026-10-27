import { DomainRefusal } from '@ddd-ts-kit/kernel';

export class InvalidMoney extends DomainRefusal {
  readonly code = 'INVALID_MONEY';

  static forCents(cents: number) {
    return InvalidMoney.refusal('An amount is a whole number of cents, within the safe integers.', { cents });
  }
}
