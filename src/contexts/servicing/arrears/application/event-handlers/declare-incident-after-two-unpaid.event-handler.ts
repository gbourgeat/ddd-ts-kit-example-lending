import { systemActor, type CommandBus } from '@ddd-ts-kit/kernel';
import type { LoanInstalmentMarkedUnpaid } from '@/contexts/servicing/instalments/domain/events/loan-instalment-marked-unpaid.event';
import { DeclareRepaymentIncidentCommand } from '@/contexts/servicing/arrears/application/commands/declare-repayment-incident/declare-repayment-incident.command';

/** When an instalment is marked unpaid, the loan is asked to declare its repayment incident: the loan decides. */
export class DeclareIncidentAfterTwoUnpaidEventHandler {
  constructor(private readonly commands: CommandBus) {}

  async handle(event: LoanInstalmentMarkedUnpaid): Promise<void> {
    await this.commands.execute(
      new DeclareRepaymentIncidentCommand(systemActor('DeclareIncidentAfterTwoUnpaidEventHandler'), event.aggregateId),
    );
  }
}
