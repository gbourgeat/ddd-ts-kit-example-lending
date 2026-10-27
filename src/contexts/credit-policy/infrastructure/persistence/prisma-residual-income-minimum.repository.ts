import { stampCreation, stampUpdate, tenantScopeOf, type Clock, type ExecutionScope } from '@ddd-ts-kit/kernel';
import { optimisticUpdate, ownTenantWhere, tenantWhere } from '@ddd-ts-kit/prisma';
import type { ResidualIncomeMinimum } from '@/contexts/credit-policy/domain/aggregates/residual-income-minimum.aggregate';
import type { ResidualIncomeMinimumRepository } from '@/contexts/credit-policy/domain/repositories/residual-income-minimum.repository';
import type { Database } from '@/platform/database/database';
import {
  ResidualIncomeMinimumMapper,
  type ResidualIncomeMinimumColumns,
} from '@/contexts/credit-policy/infrastructure/persistence/residual-income-minimum.mapper';

type VersionedResidualIncomeMinimum = ResidualIncomeMinimumColumns & { readonly version: number };

export class PrismaResidualIncomeMinimumRepository implements ResidualIncomeMinimumRepository {
  constructor(
    private readonly database: Database,
    private readonly scope: ExecutionScope,
    private readonly clock: Clock,
  ) {}

  async findById(id: string): Promise<ResidualIncomeMinimum | undefined> {
    // findFirst, not findUnique: the tenant is part of every condition, and it is not part of the key.
    const row = await this.database.client().creditPolicyResidualIncomeMinimum.findFirst({
      where: { id, ...tenantWhere(this.scope) },
    });

    return row === null ? undefined : ResidualIncomeMinimumMapper.toDomain(row);
  }

  async save(saved: ResidualIncomeMinimum): Promise<void> {
    await optimisticUpdate(saved, async ({ expected, next }) => {
      const state = { ...ResidualIncomeMinimumMapper.toRow(saved), version: next };
      const written = expected === 0 ? await this.insert(state) : await this.update(state, expected);

      return written.count;
    });
  }

  /** The row is written in the tenant of the work: `tenantScopeOf` names it, `tenantWhere` finds it again. */
  private insert(state: VersionedResidualIncomeMinimum): Promise<{ count: number }> {
    const row = { ...state, ...tenantScopeOf(this.scope), ...stampCreation(this.scope, this.clock) };

    return this.database.client().creditPolicyResidualIncomeMinimum.createMany({ data: [row], skipDuplicates: true });
  }

  private update(state: VersionedResidualIncomeMinimum, expected: number): Promise<{ count: number }> {
    return this.database.client().creditPolicyResidualIncomeMinimum.updateMany({
      where: { id: state.id, version: expected, ...ownTenantWhere(this.scope) },
      data: { ...state, ...stampUpdate(this.scope, this.clock) },
    });
  }
}
