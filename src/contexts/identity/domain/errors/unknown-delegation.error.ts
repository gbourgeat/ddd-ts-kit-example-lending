import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { IdentityCodes } from '@/contexts/identity/identity.codes';

export class UnknownDelegation extends DomainRefusal {
  readonly code = IdentityCodes.UnknownDelegation;

  static forDelegation(delegationId: string) {
    return UnknownDelegation.refusal(`No delegation ${delegationId}.`, { delegationId }).exposing('delegationId');
  }
}
