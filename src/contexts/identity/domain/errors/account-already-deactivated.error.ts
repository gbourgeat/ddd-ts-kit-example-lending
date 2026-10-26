import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { IdentityCodes } from '@/contexts/identity/identity.codes';

export class AccountAlreadyDeactivated extends DomainRefusal {
  readonly code = IdentityCodes.AccountAlreadyDeactivated;

  static forAccount(accountId: string) {
    return AccountAlreadyDeactivated.refusal(`The account ${accountId} is already deactivated.`, { accountId });
  }
}
