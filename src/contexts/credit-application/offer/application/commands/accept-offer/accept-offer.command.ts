import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** The borrower signs the offer electronically: refused once its 15 days of validity from the issue are over. */
export class AcceptOfferCommand extends AuthorizedCommand<void> {
  constructor(
    actor: Actor,
    readonly offerId: string,
  ) {
    super(actor);
  }
}
