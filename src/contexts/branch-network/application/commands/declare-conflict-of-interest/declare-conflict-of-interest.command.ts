import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** Declares a conflict of interest between the member of staff signed in and a customer: the declarer is read from the actor. */
export class DeclareConflictOfInterestCommand extends AuthorizedCommand<string> {
  constructor(
    actor: Actor,
    readonly customerId: string,
  ) {
    super(actor);
  }
}
