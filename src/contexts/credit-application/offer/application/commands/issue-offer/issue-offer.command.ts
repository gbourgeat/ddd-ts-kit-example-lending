import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** Issues the offer drafted for an application to its borrower, once its pre-contractual sheet is out. */
export class IssueOfferCommand extends AuthorizedCommand<void> {
  constructor(
    actor: Actor,
    readonly applicationId: string,
  ) {
    super(actor);
  }
}
