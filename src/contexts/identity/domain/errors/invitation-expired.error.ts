import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { IdentityCodes } from '@/contexts/identity/identity.codes';

export class InvitationExpired extends DomainRefusal {
  readonly code = IdentityCodes.InvitationExpired;

  static forInvitation(invitationId: string, expiresAt: Date) {
    return InvitationExpired.refusal(`The invitation ${invitationId} expired.`, {
      invitationId,
      expiresAt,
    }).exposing('expiresAt');
  }
}
