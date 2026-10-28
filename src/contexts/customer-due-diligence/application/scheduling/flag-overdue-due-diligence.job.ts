import { systemActor, type CommandBus, type JobExecution, type ScheduledJob } from '@ddd-ts-kit/kernel';
import { FlagAllOverdueDueDiligenceCommand } from '@/contexts/customer-due-diligence/application/commands/flag-all-overdue-due-diligence/flag-all-overdue-due-diligence.command';

export class FlagOverdueDueDiligenceJob implements ScheduledJob {
  constructor(private readonly commands: CommandBus) {}

  async run(execution: JobExecution): Promise<void> {
    // TODO(domain): hand FlagAllOverdueDueDiligenceCommand the other data it needs once its constructor declares them; which period the work is for is said by `execution.scheduledAt`, never by the clock: an occurrence may run late, or twice.
    await this.commands.execute(
      new FlagAllOverdueDueDiligenceCommand(
        systemActor('customer-due-diligence.flag-overdue-due-diligence'),
        execution.scheduledAt,
      ),
    );
  }
}
