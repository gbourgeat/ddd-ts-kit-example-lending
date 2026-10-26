import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { IdentityCodes } from '@/contexts/identity/identity.codes';

export class DelegationToOneself extends DomainRefusal {
  readonly code = IdentityCodes.DelegationToOneself;

  static forAccount(accountId: string) {
    return DelegationToOneself.refusal('A member delegates to another member.', { accountId });
  }
}
