import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { IdentityCodes } from '@/contexts/identity/identity.codes';

export class InvalidEmailAddress extends DomainRefusal {
  readonly code = IdentityCodes.InvalidEmailAddress;

  static forValue(raw: string) {
    return InvalidEmailAddress.refusal('An email address is a local part, an @ and a domain.', { raw });
  }
}
