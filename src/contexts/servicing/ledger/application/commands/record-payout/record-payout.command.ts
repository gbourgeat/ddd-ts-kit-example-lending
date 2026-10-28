import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** Records the payout of an approved application: its loan is born paid out, with the schedule of its instalments. */
export class RecordPayoutCommand extends AuthorizedCommand<string> {
  constructor(
    actor: Actor,
    readonly payout: {
      /** The loan is named after its application: one loan per application. */
      readonly loanId: string;
      readonly borrowerName: string;
      readonly amountCents: number;
      readonly durationMonths: number;
      readonly annualRateBasisPoints: number;
    },
  ) {
    super(actor);
  }
}
