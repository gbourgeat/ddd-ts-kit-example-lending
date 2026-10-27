import { stampCreation, stampUpdate, tenantScopeOf, type Clock, type ExecutionScope } from '@ddd-ts-kit/kernel';
import { optimisticUpdate, ownTenantWhere, tenantWhere } from '@ddd-ts-kit/prisma';
import type { RetentionPeriod } from '@/contexts/data-protection/domain/aggregates/retention-period.aggregate';
import type { RetentionPeriodRepository } from '@/contexts/data-protection/domain/repositories/retention-period.repository';
import type { Database } from '@/platform/database/database';
import {
  RetentionPeriodMapper,
  type RetentionPeriodColumns,
} from '@/contexts/data-protection/infrastructure/persistence/retention-period.mapper';

type VersionedRetentionPeriod = RetentionPeriodColumns & { readonly version: number };

export class PrismaRetentionPeriodRepository implements RetentionPeriodRepository {
  constructor(
    private readonly database: Database,
    private readonly scope: ExecutionScope,
    private readonly clock: Clock,
  ) {}

  async findById(id: string): Promise<RetentionPeriod | undefined> {
    // findFirst, not findUnique: the tenant is part of every condition, and it is not part of the key.
    const row = await this.database.client().dataProtectionRetentionPeriod.findFirst({
      where: { id, ...tenantWhere(this.scope) },
    });

    return row === null ? undefined : RetentionPeriodMapper.toDomain(row);
  }

  async save(saved: RetentionPeriod): Promise<void> {
    await optimisticUpdate(saved, async ({ expected, next }) => {
      const state = { ...RetentionPeriodMapper.toRow(saved), version: next };
      const written = expected === 0 ? await this.insert(state) : await this.update(state, expected);

      return written.count;
    });
  }

  /** The row is written in the tenant of the work: `tenantScopeOf` names it, `tenantWhere` finds it again. */
  private insert(state: VersionedRetentionPeriod): Promise<{ count: number }> {
    const row = { ...state, ...tenantScopeOf(this.scope), ...stampCreation(this.scope, this.clock) };

    return this.database.client().dataProtectionRetentionPeriod.createMany({ data: [row], skipDuplicates: true });
  }

  private update(state: VersionedRetentionPeriod, expected: number): Promise<{ count: number }> {
    return this.database.client().dataProtectionRetentionPeriod.updateMany({
      where: { id: state.id, version: expected, ...ownTenantWhere(this.scope) },
      data: { ...state, ...stampUpdate(this.scope, this.clock) },
    });
  }
}
