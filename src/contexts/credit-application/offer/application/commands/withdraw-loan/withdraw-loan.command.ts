import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** The borrower withdraws the application, without a reason: the signing of its offer and the 14 days are checked by the file. */
export class WithdrawLoanCommand extends AuthorizedCommand<void> {
  constructor(
    actor: Actor,
    readonly applicationId: string,
  ) {
    super(actor);
  }
}
