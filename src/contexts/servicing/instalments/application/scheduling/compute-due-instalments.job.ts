import { systemActor, type CommandBus, type JobExecution, type ScheduledJob } from '@ddd-ts-kit/kernel';
import { ComputeDueInstalmentsCommand } from '@/contexts/servicing/instalments/application/commands/compute-due-instalments/compute-due-instalments.command';

export class ComputeDueInstalmentsJob implements ScheduledJob {
  constructor(private readonly commands: CommandBus) {}

  async run(execution: JobExecution): Promise<void> {
    // TODO(domain): give ComputeDueInstalmentsCommand a constructor parameter for the instant the work is for and pass it `execution.scheduledAt`; which period the work is for is said by `execution.scheduledAt`, never by the clock: an occurrence may run late, or twice.
    await this.commands.execute(new ComputeDueInstalmentsCommand(systemActor('servicing.compute-due-instalments')));
  }
}
