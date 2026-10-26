import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { IdentityCodes } from '@/contexts/identity/identity.codes';

export class DeactivatedAccount extends DomainRefusal {
  readonly code = IdentityCodes.DeactivatedAccount;

  static forAccount(accountId: string) {
    return DeactivatedAccount.refusal(`The account ${accountId} is deactivated.`, { accountId });
  }
}
