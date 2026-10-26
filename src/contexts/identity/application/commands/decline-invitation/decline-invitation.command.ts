import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** Declines the invitation of this token, addressed to the actor. */
export class DeclineInvitationCommand extends AuthorizedCommand<string> {
  constructor(
    actor: Actor,
    readonly token: string,
  ) {
    super(actor);
  }
}
