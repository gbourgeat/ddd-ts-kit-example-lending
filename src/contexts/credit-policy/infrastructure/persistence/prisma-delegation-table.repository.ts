import { stampCreation, stampUpdate, tenantScopeOf, type Clock, type ExecutionScope } from '@ddd-ts-kit/kernel';
import { optimisticUpdate, ownTenantWhere, tenantWhere } from '@ddd-ts-kit/prisma';
import type { DelegationTable } from '@/contexts/credit-policy/domain/aggregates/delegation-table.aggregate';
import type { DelegationTableRepository } from '@/contexts/credit-policy/domain/repositories/delegation-table.repository';
import type { Database } from '@/platform/database/database';
import {
  DelegationTableMapper,
  type DelegationTableColumns,
} from '@/contexts/credit-policy/infrastructure/persistence/delegation-table.mapper';

type VersionedDelegationTable = DelegationTableColumns & { readonly version: number };

export class PrismaDelegationTableRepository implements DelegationTableRepository {
  constructor(
    private readonly database: Database,
    private readonly scope: ExecutionScope,
    private readonly clock: Clock,
  ) {}

  async findById(id: string): Promise<DelegationTable | undefined> {
    // findFirst, not findUnique: the tenant is part of every condition, and it is not part of the key.
    const row = await this.database.client().creditPolicyDelegationTable.findFirst({
      where: { id, ...tenantWhere(this.scope) },
    });

    return row === null ? undefined : DelegationTableMapper.toDomain(row);
  }

  async save(saved: DelegationTable): Promise<void> {
    await optimisticUpdate(saved, async ({ expected, next }) => {
      const state = { ...DelegationTableMapper.toRow(saved), version: next };
      const written = expected === 0 ? await this.insert(state) : await this.update(state, expected);

      return written.count;
    });
  }

  /** The row is written in the tenant of the work: `tenantScopeOf` names it, `tenantWhere` finds it again. */
  private insert(state: VersionedDelegationTable): Promise<{ count: number }> {
    const row = { ...state, ...tenantScopeOf(this.scope), ...stampCreation(this.scope, this.clock) };

    return this.database.client().creditPolicyDelegationTable.createMany({ data: [row], skipDuplicates: true });
  }

  private update(state: VersionedDelegationTable, expected: number): Promise<{ count: number }> {
    return this.database.client().creditPolicyDelegationTable.updateMany({
      where: { id: state.id, version: expected, ...ownTenantWhere(this.scope) },
      data: { ...state, ...stampUpdate(this.scope, this.clock) },
    });
  }
}
