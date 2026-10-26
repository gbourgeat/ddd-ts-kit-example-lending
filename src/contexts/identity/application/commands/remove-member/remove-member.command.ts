import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** Removes a member from an organisation. */
export class RemoveMemberCommand extends AuthorizedCommand<string> {
  constructor(
    actor: Actor,
    readonly organisationId: string,
    readonly accountId: string,
  ) {
    super(actor);
  }
}
