import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** Drafts the offer of an approved application: its price is read from the grid and the maximum in force today. */
export class DraftOfferCommand extends AuthorizedCommand<string> {
  constructor(
    actor: Actor,
    readonly applicationId: string,
  ) {
    super(actor);
  }
}
