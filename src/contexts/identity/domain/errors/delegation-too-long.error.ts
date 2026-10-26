import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { IdentityCodes } from '@/contexts/identity/identity.codes';

export class DelegationTooLong extends DomainRefusal {
  readonly code = IdentityCodes.DelegationTooLong;

  static withLongestDays(longestDays: number) {
    return DelegationTooLong.refusal(`A delegation lasts ${longestDays} days at most: a longer one is a role.`, {
      longestDays,
    }).exposing('longestDays');
  }
}
