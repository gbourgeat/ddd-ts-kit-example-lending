import { systemActor, type CommandBus, type JobExecution, type ScheduledJob } from '@ddd-ts-kit/kernel';
import { ClassifyArrearsCommand } from '@/contexts/servicing/arrears/application/commands/classify-arrears/classify-arrears.command';

export class ClassifyArrearsJob implements ScheduledJob {
  constructor(private readonly commands: CommandBus) {}

  async run(execution: JobExecution): Promise<void> {
    // TODO(domain): give ClassifyArrearsCommand a constructor parameter for the instant the work is for and pass it `execution.scheduledAt`; which period the work is for is said by `execution.scheduledAt`, never by the clock: an occurrence may run late, or twice.
    await this.commands.execute(new ClassifyArrearsCommand(systemActor('servicing.classify-arrears')));
  }
}
