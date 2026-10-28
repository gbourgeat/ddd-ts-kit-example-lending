import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** Closes the loan: its ledger is over. */
export class CloseLoanCommand extends AuthorizedCommand<void> {
  constructor(
    actor: Actor,
    readonly loanId: string,
  ) {
    super(actor);
  }
}
