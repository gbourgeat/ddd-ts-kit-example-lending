import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** Ends the business relationship with a customer: on a confirmed sanctions match, as the system. */
export class EndRelationshipCommand extends AuthorizedCommand<string> {
  constructor(
    actor: Actor,
    readonly customerId: string,
  ) {
    super(actor);
  }
}
