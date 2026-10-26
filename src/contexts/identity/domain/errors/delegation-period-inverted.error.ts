import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { IdentityCodes } from '@/contexts/identity/identity.codes';

export class DelegationPeriodInverted extends DomainRefusal {
  readonly code = IdentityCodes.DelegationPeriodInverted;

  static forPeriod(startsAt: Date, endsAt: Date) {
    return DelegationPeriodInverted.refusal('A delegation ends after it starts.', {
      startsAt,
      endsAt,
    }).exposing('startsAt', 'endsAt');
  }
}
