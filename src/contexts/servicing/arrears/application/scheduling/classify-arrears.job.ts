import { systemActor, type CommandBus, type JobExecution, type ScheduledJob } from '@ddd-ts-kit/kernel';
import { ClassifyArrearsCommand } from '@/contexts/servicing/arrears/application/commands/classify-arrears/classify-arrears.command';

export class ClassifyArrearsJob implements ScheduledJob {
  constructor(private readonly commands: CommandBus) {}

  async run(execution: JobExecution): Promise<void> {
    // The instant the occurrence is for, never the clock: an occurrence may run late, or twice.
    await this.commands.execute(
      new ClassifyArrearsCommand(systemActor('servicing.classify-arrears'), execution.scheduledAt),
    );
  }
}
