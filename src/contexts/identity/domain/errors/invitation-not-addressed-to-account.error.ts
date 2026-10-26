import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { IdentityCodes } from '@/contexts/identity/identity.codes';

export class InvitationNotAddressedToAccount extends DomainRefusal {
  readonly code = IdentityCodes.InvitationNotAddressedToAccount;

  static forInvitation(invitationId: string) {
    return InvitationNotAddressedToAccount.refusal(
      `The invitation ${invitationId} is addressed to another email address than the account's.`,
      { invitationId },
    );
  }
}
