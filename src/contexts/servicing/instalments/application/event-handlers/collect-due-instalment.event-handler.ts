import { systemActor, type CommandBus } from '@ddd-ts-kit/kernel';
import type { LoanInstalmentDueNoted } from '@/contexts/servicing/ledger/domain/events/loan-instalment-due-noted.event';
import { CollectInstalmentCommand } from '@/contexts/servicing/instalments/application/commands/collect-instalment/collect-instalment.command';

/** When an instalment is noted due, its direct debit is collected: the reaction sends the command as a system actor. */
export class CollectDueInstalmentEventHandler {
  constructor(private readonly commands: CommandBus) {}

  async handle(event: LoanInstalmentDueNoted): Promise<void> {
    await this.commands.execute(
      new CollectInstalmentCommand(systemActor('CollectDueInstalmentEventHandler'), event.aggregateId, {
        number: event.number,
        amountCents: event.amount.cents,
      }),
    );
  }
}
