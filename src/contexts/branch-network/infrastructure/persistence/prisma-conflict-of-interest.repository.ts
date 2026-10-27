import { stampCreation, stampUpdate, tenantScopeOf, type Clock, type ExecutionScope } from '@ddd-ts-kit/kernel';
import { optimisticUpdate, ownTenantWhere, tenantWhere } from '@ddd-ts-kit/prisma';
import type { ConflictOfInterest } from '@/contexts/branch-network/domain/aggregates/conflict-of-interest.aggregate';
import type { ConflictOfInterestRepository } from '@/contexts/branch-network/domain/repositories/conflict-of-interest.repository';
import type { Database } from '@/platform/database/database';
import {
  ConflictOfInterestMapper,
  type ConflictOfInterestColumns,
} from '@/contexts/branch-network/infrastructure/persistence/conflict-of-interest.mapper';

type VersionedConflictOfInterest = ConflictOfInterestColumns & { readonly version: number };

export class PrismaConflictOfInterestRepository implements ConflictOfInterestRepository {
  constructor(
    private readonly database: Database,
    private readonly scope: ExecutionScope,
    private readonly clock: Clock,
  ) {}

  async findById(id: string): Promise<ConflictOfInterest | undefined> {
    // findFirst, not findUnique: the tenant is part of every condition, and it is not part of the key.
    const row = await this.database.client().branchNetworkConflictOfInterest.findFirst({
      where: { id, ...tenantWhere(this.scope) },
    });

    return row === null ? undefined : ConflictOfInterestMapper.toDomain(row);
  }

  async save(saved: ConflictOfInterest): Promise<void> {
    await optimisticUpdate(saved, async ({ expected, next }) => {
      const state = { ...ConflictOfInterestMapper.toRow(saved), version: next };
      const written = expected === 0 ? await this.insert(state) : await this.update(state, expected);

      return written.count;
    });
  }

  /** The row is written in the tenant of the work: `tenantScopeOf` names it, `tenantWhere` finds it again. */
  private insert(state: VersionedConflictOfInterest): Promise<{ count: number }> {
    const row = { ...state, ...tenantScopeOf(this.scope), ...stampCreation(this.scope, this.clock) };

    return this.database.client().branchNetworkConflictOfInterest.createMany({ data: [row], skipDuplicates: true });
  }

  private update(state: VersionedConflictOfInterest, expected: number): Promise<{ count: number }> {
    return this.database.client().branchNetworkConflictOfInterest.updateMany({
      where: { id: state.id, version: expected, ...ownTenantWhere(this.scope) },
      data: { ...state, ...stampUpdate(this.scope, this.clock) },
    });
  }
}
