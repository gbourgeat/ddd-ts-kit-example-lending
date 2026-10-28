import type { CommandHandler } from '@ddd-ts-kit/kernel';
import type { RelationTupleStore } from '@ddd-ts-kit/auth/rebac';
import type { DeciderLevels } from '@/contexts/credit-application/decision/application/ports/decider-levels.port';
import type { KeepDeciderLevelCommand } from '@/contexts/credit-application/decision/application/commands/keep-decider-level/keep-decider-level.command';

/**
 * Writes the level of the command's staff member into the read model, unless the read model holds a later event. The
 * account of the staff member becomes a decider of the context, who may decide within the limit of the level.
 */
export class KeepDeciderLevelHandler implements CommandHandler<KeepDeciderLevelCommand> {
  constructor(
    private readonly deciderLevels: DeciderLevels,
    private readonly relations: RelationTupleStore,
  ) {}

  async execute(command: KeepDeciderLevelCommand): Promise<void> {
    const { row, stamp } = command;
    const written = await this.deciderLevels.upsertIfNewer(row.staffMemberId, stamp, () => row);

    if (written === 'applied') {
      await this.relations.write([
        { object: 'context:credit-application', relation: 'decider', subject: `user:${row.staffMemberId}` },
      ]);
    }
  }
}
