import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** Repays capital of the loan before its schedule ends: the fee is charged on it, and the whole outstanding capital closes the loan. */
export class RepayEarlyCommand extends AuthorizedCommand<void> {
  constructor(
    actor: Actor,
    readonly loanId: string,
    readonly capitalCents: number,
  ) {
    super(actor);
  }
}
