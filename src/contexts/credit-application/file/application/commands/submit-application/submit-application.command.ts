import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** The applicant submits a loan request for an amount in cents, over a duration in months: the actor is the customer. */
export class SubmitApplicationCommand extends AuthorizedCommand<string> {
  constructor(
    actor: Actor,
    readonly amountInCents: number,
    readonly durationMonths: number,
    /** The product the application is for: empty when none is given. */
    readonly productId = '',
  ) {
    super(actor);
  }
}
