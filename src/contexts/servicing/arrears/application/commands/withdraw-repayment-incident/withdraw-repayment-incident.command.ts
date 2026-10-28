import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** Withdraws the declaration of the loan from the repayment incident register once its arrears are paid. */
export class WithdrawRepaymentIncidentCommand extends AuthorizedCommand<void> {
  constructor(
    actor: Actor,
    readonly loanId: string,
  ) {
    super(actor);
  }
}
