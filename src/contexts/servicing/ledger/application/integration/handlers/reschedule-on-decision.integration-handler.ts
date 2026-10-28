import { systemActor, type CommandBus } from '@ddd-ts-kit/kernel';
import {
  creditApplicationRescheduleDecidedV1,
  type CreditApplicationRescheduleDecidedV1,
} from '@/contexts/credit-application/published-language';
import { RescheduleLoanCommand } from '@/contexts/servicing/ledger/application/commands/reschedule-loan/reschedule-loan.command';

// ddd-ts-kit-disable-next-line events/consumer-idempotent -- ADR-0009: registered in its module file, which the rule does not read
export class RescheduleOnDecisionIntegrationHandler {
  static readonly eventType = creditApplicationRescheduleDecidedV1.type;

  readonly actor = systemActor('servicing.reschedule-on-decision');

  constructor(private readonly commands: CommandBus) {}

  /** Safe to repeat: the decision is the event id, and the loan records each decision once. */
  async handle(event: CreditApplicationRescheduleDecidedV1): Promise<void> {
    const { payload } = event;

    await this.commands.execute(
      new RescheduleLoanCommand(this.actor, {
        loanId: payload.creditApplicationId,
        decisionId: event.id,
        capitalCents: payload.outstandingAmountCents,
        durationMonths: payload.durationMonths,
      }),
    );
  }
}
