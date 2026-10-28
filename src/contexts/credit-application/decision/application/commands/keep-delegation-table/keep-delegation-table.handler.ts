import type { CommandHandler } from '@ddd-ts-kit/kernel';
import type { DelegationTables } from '@/contexts/credit-application/decision/application/ports/delegation-tables.port';
import type { KeepDelegationTableCommand } from '@/contexts/credit-application/decision/application/commands/keep-delegation-table/keep-delegation-table.command';

/** Writes the delegation table of the command into the read model, unless the read model holds a later event. */
export class KeepDelegationTableHandler implements CommandHandler<KeepDelegationTableCommand> {
  constructor(private readonly delegationTables: DelegationTables) {}

  async execute(command: KeepDelegationTableCommand): Promise<void> {
    const { row, stamp } = command;

    await this.delegationTables.upsertIfNewer(row.delegationTableId, stamp, () => row);
  }
}
