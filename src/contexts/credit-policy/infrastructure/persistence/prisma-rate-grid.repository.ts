import { stampCreation, stampUpdate, tenantScopeOf, type Clock, type ExecutionScope } from '@ddd-ts-kit/kernel';
import { optimisticUpdate, ownTenantWhere, tenantWhere } from '@ddd-ts-kit/prisma';
import type { RateGrid } from '@/contexts/credit-policy/domain/aggregates/rate-grid.aggregate';
import type { RateGridRepository } from '@/contexts/credit-policy/domain/repositories/rate-grid.repository';
import type { Database } from '@/platform/database/database';
import {
  RateGridMapper,
  type RateGridColumns,
} from '@/contexts/credit-policy/infrastructure/persistence/rate-grid.mapper';

type VersionedRateGrid = RateGridColumns & { readonly version: number };

export class PrismaRateGridRepository implements RateGridRepository {
  constructor(
    private readonly database: Database,
    private readonly scope: ExecutionScope,
    private readonly clock: Clock,
  ) {}

  async findById(id: string): Promise<RateGrid | undefined> {
    // findFirst, not findUnique: the tenant is part of every condition, and it is not part of the key.
    const row = await this.database.client().creditPolicyRateGrid.findFirst({
      where: { id, ...tenantWhere(this.scope) },
    });

    return row === null ? undefined : RateGridMapper.toDomain(row);
  }

  async save(saved: RateGrid): Promise<void> {
    await optimisticUpdate(saved, async ({ expected, next }) => {
      const state = { ...RateGridMapper.toRow(saved), version: next };
      const written = expected === 0 ? await this.insert(state) : await this.update(state, expected);

      return written.count;
    });
  }

  /** The row is written in the tenant of the work: `tenantScopeOf` names it, `tenantWhere` finds it again. */
  private insert(state: VersionedRateGrid): Promise<{ count: number }> {
    const row = { ...state, ...tenantScopeOf(this.scope), ...stampCreation(this.scope, this.clock) };

    return this.database.client().creditPolicyRateGrid.createMany({ data: [row], skipDuplicates: true });
  }

  private update(state: VersionedRateGrid, expected: number): Promise<{ count: number }> {
    return this.database.client().creditPolicyRateGrid.updateMany({
      where: { id: state.id, version: expected, ...ownTenantWhere(this.scope) },
      data: { ...state, ...stampUpdate(this.scope, this.clock) },
    });
  }
}
