import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** Ends a delegation of an organisation before its period. */
export class RevokeDelegationCommand extends AuthorizedCommand<string> {
  constructor(
    actor: Actor,
    readonly organisationId: string,
    readonly delegationId: string,
  ) {
    super(actor);
  }
}
