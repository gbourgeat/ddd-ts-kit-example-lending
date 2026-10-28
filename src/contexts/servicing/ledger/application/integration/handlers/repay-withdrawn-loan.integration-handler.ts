import { systemActor, type CommandBus } from '@ddd-ts-kit/kernel';
import {
  creditApplicationWithdrawnV1,
  type CreditApplicationWithdrawnV1,
} from '@/contexts/credit-application/published-language';
import { RecordWithdrawalRepaymentCommand } from '@/contexts/servicing/ledger/application/commands/record-withdrawal-repayment/record-withdrawal-repayment.command';

export class RepayWithdrawnLoanIntegrationHandler {
  static readonly eventType = creditApplicationWithdrawnV1.type;

  readonly actor = systemActor('servicing.repay-withdrawn-loan');

  constructor(private readonly commands: CommandBus) {}

  /** Safe to repeat: the repayment of a loan closed by an earlier delivery records nothing. */
  async handle(event: CreditApplicationWithdrawnV1): Promise<void> {
    await this.commands.execute(
      new RecordWithdrawalRepaymentCommand(this.actor, {
        loanId: event.payload.creditApplicationId,
        withdrawnAt: new Date(event.occurredAt),
      }),
    );
  }
}
