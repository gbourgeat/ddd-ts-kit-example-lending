import type { CommandHandler } from '@ddd-ts-kit/kernel';
import type { DeciderLevels } from '@/contexts/credit-application/decision/application/ports/decider-levels.port';
import type { KeepDeciderLevelCommand } from '@/contexts/credit-application/decision/application/commands/keep-decider-level/keep-decider-level.command';

/** Writes the level of the command's staff member into the read model, unless the read model holds a later event. */
export class KeepDeciderLevelHandler implements CommandHandler<KeepDeciderLevelCommand> {
  constructor(private readonly deciderLevels: DeciderLevels) {}

  async execute(command: KeepDeciderLevelCommand): Promise<void> {
    const { row, stamp } = command;

    await this.deciderLevels.upsertIfNewer(row.staffMemberId, stamp, () => row);
  }
}
