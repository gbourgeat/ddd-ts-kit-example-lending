import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { IdentityCodes } from '@/contexts/identity/identity.codes';

export class RightNotInRole extends DomainRefusal {
  readonly code = IdentityCodes.RightNotInRole;

  static forRight(right: string) {
    return RightNotInRole.refusal(`A member lends only the rights they hold: ${right}.`, {
      right,
    }).exposing('right');
  }
}
