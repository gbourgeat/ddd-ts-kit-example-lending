import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';
import type { MemberRole } from '@/contexts/identity/domain/vocabularies/member-role.vocabulary';

/** Invites a person to an organisation by email address, in a role: the answer carries the token to send them, never stored. */
export class InviteMemberCommand extends AuthorizedCommand<{ readonly id: string; readonly token: string }> {
  constructor(
    actor: Actor,
    readonly organisationId: string,
    readonly invitee: { readonly email: string; readonly role: MemberRole },
  ) {
    super(actor);
  }
}
