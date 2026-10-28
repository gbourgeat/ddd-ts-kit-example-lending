import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** Records the repayment of a loan by the withdrawal of its application after the payout: the loan then ends. */
export class RecordWithdrawalRepaymentCommand extends AuthorizedCommand<void> {
  constructor(
    actor: Actor,
    readonly withdrawal: {
      /** The loan is named after its application: one loan per application. */
      readonly loanId: string;
      /** The instant of the withdrawal: the interest accrues up to it. */
      readonly withdrawnAt: Date;
    },
  ) {
    super(actor);
  }
}
