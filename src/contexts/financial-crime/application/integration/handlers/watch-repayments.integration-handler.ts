import { systemActor, type CommandBus } from '@ddd-ts-kit/kernel';
import { loanPaymentReceivedV1, type LoanPaymentReceivedV1 } from '@/contexts/servicing/published-language';
import {
  RaiseAlertCommand,
  type RepaymentFacts,
} from '@/contexts/financial-crime/application/commands/raise-alert/raise-alert.command';

export class WatchRepaymentsIntegrationHandler {
  static readonly eventType = loanPaymentReceivedV1.type;

  readonly actor = systemActor('financial-crime.watch-repayments');

  constructor(private readonly commands: CommandBus) {}

  /** The repayment is identified by the event that announced it: a delivery twice raises at most one alert. */
  async handle(event: LoanPaymentReceivedV1): Promise<void> {
    await this.commands.execute(new RaiseAlertCommand(this.actor, event.id, this.factsOf(event)));
  }

  /**
   * The facts servicing publishes: the loan and the amount, nothing else. Servicing does not say the kind of the
   * payment, so it is taken as an instalment, never an early repayment. It collects an instalment only by direct
   * debit from the borrower's own mandate, so the payer is that mandate. Until servicing publishes the payer account
   * and the early repayment flag, the two alert rules cannot break here.
   */
  private factsOf(event: LoanPaymentReceivedV1): RepaymentFacts {
    const paidAt = new Date(event.occurredAt);
    const mandate = `direct-debit-mandate:${event.payload.loanId}`;

    return {
      amountCents: event.payload.amountCents,
      early: false,
      paidAt,
      payoutAt: paidAt,
      earlyRepaidWithinYearCents: 0,
      payerAccount: mandate,
      borrowerAccounts: [mandate],
    };
  }
}
