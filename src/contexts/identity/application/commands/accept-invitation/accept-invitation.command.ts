import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** Accepts the invitation of this token, addressed to the actor: the actor becomes a member. */
export class AcceptInvitationCommand extends AuthorizedCommand<string> {
  constructor(
    actor: Actor,
    readonly token: string,
  ) {
    super(actor);
  }
}
