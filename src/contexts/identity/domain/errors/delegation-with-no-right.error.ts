import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { IdentityCodes } from '@/contexts/identity/identity.codes';

export class DelegationWithNoRight extends DomainRefusal {
  readonly code = IdentityCodes.DelegationWithNoRight;

  static withNoRight() {
    return DelegationWithNoRight.refusal('A delegation lends at least one right.');
  }
}
