import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** Declares the loan to the repayment incident register once two consecutive instalments are unpaid, and once only. */
export class DeclareRepaymentIncidentCommand extends AuthorizedCommand<void> {
  constructor(
    actor: Actor,
    readonly loanId: string,
  ) {
    super(actor);
  }
}
