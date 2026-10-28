import type { QueryHandler } from '@ddd-ts-kit/kernel';
import type { DelegationTables } from '@/contexts/credit-application/decision/application/ports/delegation-tables.port';
import type { ReadDelegationTableQuery } from '@/contexts/credit-application/decision/application/queries/read-delegation-table/read-delegation-table.query';
import type { ReadDelegationTableResult } from '@/contexts/credit-application/decision/application/queries/read-delegation-table/read-delegation-table.result';
import { UnknownDelegationTable } from '@/contexts/credit-application/decision/domain/errors/unknown-delegation-table.error';

export class ReadDelegationTableHandler implements QueryHandler<ReadDelegationTableQuery> {
  constructor(private readonly delegationTables: DelegationTables) {}

  async execute(query: ReadDelegationTableQuery): Promise<ReadDelegationTableResult> {
    const delegationTable = await this.delegationTables.get(query.delegationTableId);

    if (delegationTable === undefined) {
      throw UnknownDelegationTable.forUnknownDelegationTable();
    }

    return {
      delegationTableId: delegationTable.delegationTableId,
      effectiveFrom: delegationTable.effectiveFrom.toISOString(),
      levels: delegationTable.levels,
    };
  }
}
