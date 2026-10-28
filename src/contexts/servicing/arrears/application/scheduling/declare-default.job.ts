import { systemActor, type CommandBus, type JobExecution, type ScheduledJob } from '@ddd-ts-kit/kernel';
import { DeclareDefaultCommand } from '@/contexts/servicing/arrears/application/commands/declare-default/declare-default.command';

export class DeclareDefaultJob implements ScheduledJob {
  constructor(private readonly commands: CommandBus) {}

  async run(execution: JobExecution): Promise<void> {
    // The instant the occurrence is for, never the clock: an occurrence may run late, or twice.
    await this.commands.execute(
      new DeclareDefaultCommand(systemActor('servicing.declare-default'), execution.scheduledAt),
    );
  }
}
