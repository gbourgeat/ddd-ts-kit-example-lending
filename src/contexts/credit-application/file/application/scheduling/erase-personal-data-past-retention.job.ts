import { systemActor, type CommandBus, type JobExecution, type ScheduledJob } from '@ddd-ts-kit/kernel';
import { ErasePersonalDataPastRetentionCommand } from '@/contexts/credit-application/file/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.command';

export class ErasePersonalDataPastRetentionJob implements ScheduledJob {
  constructor(private readonly commands: CommandBus) {}

  async run(execution: JobExecution): Promise<void> {
    // TODO(domain): give ErasePersonalDataPastRetentionCommand a constructor parameter for the instant the work is for and pass it `execution.scheduledAt`; which period the work is for is said by `execution.scheduledAt`, never by the clock: an occurrence may run late, or twice.
    await this.commands.execute(
      new ErasePersonalDataPastRetentionCommand(systemActor('credit-application.erase-personal-data-past-retention')),
    );
  }
}
