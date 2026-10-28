import { Criteria, ScopedCriteria } from '@ddd-ts-kit/kernel';
import type {
  DelegationTableLevel,
  DelegationTableRow,
  DelegationTables,
} from '@/contexts/credit-application/decision/application/ports/delegation-tables.port';
import type { DeciderLevels } from '@/contexts/credit-application/decision/application/ports/decider-levels.port';
import { TableInForce } from '@/contexts/credit-application/decision/domain/services/table-in-force.service';
import { UnknownDeciderLevel } from '@/contexts/credit-application/decision/domain/errors/unknown-decider-level.error';
import { UnknownDelegationTable } from '@/contexts/credit-application/decision/domain/errors/unknown-delegation-table.error';

/** The limit of a decider on a day: the level the staff member was appointed to, and the levels of the table in force. */
export class DeciderLimitReader {
  constructor(
    private readonly deciderLevels: DeciderLevels,
    private readonly delegationTables: DelegationTables,
  ) {}

  async readFor(staffMemberId: string, day: Date): Promise<{ level: string; levels: readonly DelegationTableLevel[] }> {
    const deciderLevel = await this.deciderLevels.get(staffMemberId);

    if (deciderLevel === undefined) {
      throw UnknownDeciderLevel.forUnknownDeciderLevel();
    }

    const table = await this.tableInForce(day);

    return { level: deciderLevel.level, levels: table.levels };
  }

  private async tableInForce(day: Date): Promise<DelegationTableRow> {
    const page = await this.delegationTables.search(
      ScopedCriteria.within(Criteria.of<DelegationTableRow>(), { conditions: [], empty: false }),
    );

    const table = new TableInForce().of(page.items, day);

    if (table === undefined) {
      throw UnknownDelegationTable.forUnknownDelegationTable();
    }

    return table;
  }
}
