import { systemActor, type CommandBus, type JobExecution, type ScheduledJob } from '@ddd-ts-kit/kernel';
import { ErasePersonalDataPastRetentionCommand } from '@/contexts/customer-due-diligence/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.command';

export class ErasePersonalDataPastRetentionJob implements ScheduledJob {
  constructor(private readonly commands: CommandBus) {}

  async run(execution: JobExecution): Promise<void> {
    // The instant the occurrence is for, never the clock: an occurrence may run late, or twice.
    await this.commands.execute(
      new ErasePersonalDataPastRetentionCommand(
        systemActor('customer-due-diligence.erase-personal-data-past-retention'),
        execution.scheduledAt,
      ),
    );
  }
}
