import { systemActor, type CommandBus, type JobExecution, type ScheduledJob } from '@ddd-ts-kit/kernel';
import { ErasePersonalDataPastRetentionCommand } from '@/contexts/credit-application/file/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.command';

export class ErasePersonalDataPastRetentionJob implements ScheduledJob {
  constructor(private readonly commands: CommandBus) {}

  async run(execution: JobExecution): Promise<void> {
    await this.commands.execute(
      new ErasePersonalDataPastRetentionCommand(
        systemActor('credit-application.erase-personal-data-past-retention'),
        execution.scheduledAt,
      ),
    );
  }
}
