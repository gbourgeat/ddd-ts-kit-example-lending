import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/**
 * Collects one instalment noted due of a loan by direct debit: the loan records the money received, or the instalment
 * unpaid when the debit is rejected. The amount is the one the due instalment was noted with.
 */
export class CollectInstalmentCommand extends AuthorizedCommand<void> {
  constructor(
    actor: Actor,
    readonly loanId: string,
    readonly instalment: { readonly number: number; readonly amountCents: number },
  ) {
    super(actor);
  }
}
