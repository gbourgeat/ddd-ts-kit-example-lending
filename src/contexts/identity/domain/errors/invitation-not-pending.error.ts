import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { IdentityCodes } from '@/contexts/identity/identity.codes';

export class InvitationNotPending extends DomainRefusal {
  readonly code = IdentityCodes.InvitationNotPending;

  static forInvitation(invitationId: string, status: string) {
    return InvitationNotPending.refusal(`The invitation ${invitationId} is already ${status}.`, {
      invitationId,
      status,
    }).exposing('status');
  }
}
