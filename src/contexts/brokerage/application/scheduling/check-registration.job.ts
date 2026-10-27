import { systemActor, type CommandBus, type JobExecution, type ScheduledJob } from '@ddd-ts-kit/kernel';
import { CheckRegistrationCommand } from '@/contexts/brokerage/application/commands/check-registration/check-registration.command';

export class CheckRegistrationJob implements ScheduledJob {
  constructor(private readonly commands: CommandBus) {}

  async run(execution: JobExecution): Promise<void> {
    // TODO(domain): give CheckRegistrationCommand a constructor parameter for the instant the work is for and pass it `execution.scheduledAt`; which period the work is for is said by `execution.scheduledAt`, never by the clock: an occurrence may run late, or twice.
    await this.commands.execute(new CheckRegistrationCommand(systemActor('brokerage.check-registration')));
  }
}
