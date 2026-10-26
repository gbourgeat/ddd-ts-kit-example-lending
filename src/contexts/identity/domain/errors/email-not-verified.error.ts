import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { IdentityCodes } from '@/contexts/identity/identity.codes';

export class EmailNotVerified extends DomainRefusal {
  readonly code = IdentityCodes.EmailNotVerified;

  static forAccount(accountId: string) {
    return EmailNotVerified.refusal(
      'The identity provider has not verified the email address of this person: they verify it, then sign in again.',
      { accountId },
    );
  }
}
