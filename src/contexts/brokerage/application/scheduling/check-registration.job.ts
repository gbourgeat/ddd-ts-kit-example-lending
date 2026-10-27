import { systemActor, type CommandBus, type JobExecution, type ScheduledJob } from '@ddd-ts-kit/kernel';
import { CheckRegistrationCommand } from '@/contexts/brokerage/application/commands/check-registration/check-registration.command';

export class CheckRegistrationJob implements ScheduledJob {
  constructor(private readonly commands: CommandBus) {}

  async run(execution: JobExecution): Promise<void> {
    await this.commands.execute(
      new CheckRegistrationCommand(systemActor('brokerage.check-registration'), execution.scheduledAt),
    );
  }
}
