import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** Writes off the outstanding capital of the loan: the loan ends, and the write-off can be reversed. */
export class WriteOffLoanCommand extends AuthorizedCommand<void> {
  constructor(
    actor: Actor,
    readonly loanId: string,
  ) {
    super(actor);
  }
}
