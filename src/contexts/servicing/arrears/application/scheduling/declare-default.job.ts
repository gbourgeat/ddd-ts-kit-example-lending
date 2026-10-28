import { systemActor, type CommandBus, type JobExecution, type ScheduledJob } from '@ddd-ts-kit/kernel';
import { DeclareDefaultCommand } from '@/contexts/servicing/arrears/application/commands/declare-default/declare-default.command';

export class DeclareDefaultJob implements ScheduledJob {
  constructor(private readonly commands: CommandBus) {}

  async run(execution: JobExecution): Promise<void> {
    // TODO(domain): give DeclareDefaultCommand a constructor parameter for the instant the work is for and pass it `execution.scheduledAt`; which period the work is for is said by `execution.scheduledAt`, never by the clock: an occurrence may run late, or twice.
    await this.commands.execute(new DeclareDefaultCommand(systemActor('servicing.declare-default')));
  }
}
