import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** Records the money of an instalment marked unpaid, paid late: the arrears are cleared once none of them is unpaid. */
export class RecordLatePaymentCommand extends AuthorizedCommand<void> {
  constructor(
    actor: Actor,
    readonly loanId: string,
    readonly payment: { readonly number: number; readonly amountCents: number },
  ) {
    super(actor);
  }
}
