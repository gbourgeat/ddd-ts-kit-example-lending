import { stampCreation, stampUpdate, tenantScopeOf, type Clock, type ExecutionScope } from '@ddd-ts-kit/kernel';
import { optimisticUpdate, ownTenantWhere, tenantWhere } from '@ddd-ts-kit/prisma';
import type { Branch } from '@/contexts/branch-network/domain/aggregates/branch.aggregate';
import type { BranchRepository } from '@/contexts/branch-network/domain/repositories/branch.repository';
import type { Database } from '@/platform/database/database';
import { BranchMapper, type BranchColumns } from '@/contexts/branch-network/infrastructure/persistence/branch.mapper';

type VersionedBranch = BranchColumns & { readonly version: number };

export class PrismaBranchRepository implements BranchRepository {
  constructor(
    private readonly database: Database,
    private readonly scope: ExecutionScope,
    private readonly clock: Clock,
  ) {}

  async findById(id: string): Promise<Branch | undefined> {
    // findFirst, not findUnique: the tenant is part of every condition, and it is not part of the key.
    const row = await this.database.client().branchNetworkBranch.findFirst({
      where: { id, ...tenantWhere(this.scope) },
    });

    return row === null ? undefined : BranchMapper.toDomain(row);
  }

  async save(saved: Branch): Promise<void> {
    await optimisticUpdate(saved, async ({ expected, next }) => {
      const state = { ...BranchMapper.toRow(saved), version: next };
      const written = expected === 0 ? await this.insert(state) : await this.update(state, expected);

      return written.count;
    });
  }

  /** The row is written in the tenant of the work: `tenantScopeOf` names it, `tenantWhere` finds it again. */
  private insert(state: VersionedBranch): Promise<{ count: number }> {
    const row = { ...state, ...tenantScopeOf(this.scope), ...stampCreation(this.scope, this.clock) };

    return this.database.client().branchNetworkBranch.createMany({ data: [row], skipDuplicates: true });
  }

  private update(state: VersionedBranch, expected: number): Promise<{ count: number }> {
    return this.database.client().branchNetworkBranch.updateMany({
      where: { id: state.id, version: expected, ...ownTenantWhere(this.scope) },
      data: { ...state, ...stampUpdate(this.scope, this.clock) },
    });
  }
}
