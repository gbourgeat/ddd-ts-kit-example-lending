import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { IdentityCodes } from '@/contexts/identity/identity.codes';

export class UnknownAccount extends DomainRefusal {
  readonly code = IdentityCodes.UnknownAccount;

  static forAccount(accountId: string) {
    return UnknownAccount.refusal(`No account ${accountId}: the person signs in once before acting.`, {
      accountId,
    }).exposing('accountId');
  }
}
