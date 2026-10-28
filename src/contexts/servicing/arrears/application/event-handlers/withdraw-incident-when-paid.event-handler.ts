import { systemActor, type CommandBus } from '@ddd-ts-kit/kernel';
import type { LoanArrearsCleared } from '@/contexts/servicing/arrears/domain/events/loan-arrears-cleared.event';
import { WithdrawRepaymentIncidentCommand } from '@/contexts/servicing/arrears/application/commands/withdraw-repayment-incident/withdraw-repayment-incident.command';

/** When the arrears of a loan are cleared, its declaration is withdrawn: the reaction sends the command as a system actor. */
export class WithdrawIncidentWhenPaidEventHandler {
  constructor(private readonly commands: CommandBus) {}

  async handle(event: LoanArrearsCleared): Promise<void> {
    await this.commands.execute(
      new WithdrawRepaymentIncidentCommand(systemActor('WithdrawIncidentWhenPaidEventHandler'), event.aggregateId),
    );
  }
}
