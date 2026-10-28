import { systemActor, type CommandBus } from '@ddd-ts-kit/kernel';
import {
  creditApplicationPayoutAuthorisedV1,
  type CreditApplicationPayoutAuthorisedV1,
} from '@/contexts/credit-application/published-language';
import type { BorrowerIdentity } from '@/contexts/servicing/ledger/application/ports/borrower-identity.port';
import { RecordPayoutCommand } from '@/contexts/servicing/ledger/application/commands/record-payout/record-payout.command';
import { BorrowerNotIdentified } from '@/contexts/servicing/ledger/domain/errors/borrower-not-identified.error';

export class RecordPayoutOnPayoutAuthorisedIntegrationHandler {
  static readonly eventType = creditApplicationPayoutAuthorisedV1.type;

  readonly actor = systemActor('servicing.record-payout-on-payout-authorised');

  constructor(
    private readonly commands: CommandBus,
    private readonly borrowers: BorrowerIdentity,
  ) {}

  /** Safe to repeat: the command finds the loan of the application when the event comes again. */
  async handle(event: CreditApplicationPayoutAuthorisedV1): Promise<void> {
    const { payload } = event;
    const borrowerName = await this.borrowers.nameOf(payload.customerId);

    if (borrowerName === undefined) {
      throw BorrowerNotIdentified.forCustomer(payload.customerId);
    }

    await this.commands.execute(
      new RecordPayoutCommand(this.actor, {
        loanId: payload.creditApplicationId,
        borrowerName,
        amountCents: payload.amountCents,
        durationMonths: payload.durationMonths,
        annualRateBasisPoints: payload.rateBasisPoints,
      }),
    );
  }
}
