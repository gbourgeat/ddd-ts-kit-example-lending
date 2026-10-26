import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** Takes back an invitation of an organisation that was not answered. */
export class RevokeInvitationCommand extends AuthorizedCommand<string> {
  constructor(
    actor: Actor,
    readonly organisationId: string,
    readonly invitationId: string,
  ) {
    super(actor);
  }
}
