import { stampCreation, stampUpdate, tenantScopeOf, type Clock, type ExecutionScope } from '@ddd-ts-kit/kernel';
import { optimisticUpdate, ownTenantWhere, tenantWhere } from '@ddd-ts-kit/prisma';
import type { LegalMaximumRate } from '@/contexts/credit-policy/domain/aggregates/legal-maximum-rate.aggregate';
import type { LegalMaximumRateRepository } from '@/contexts/credit-policy/domain/repositories/legal-maximum-rate.repository';
import type { Database } from '@/platform/database/database';
import {
  LegalMaximumRateMapper,
  type LegalMaximumRateColumns,
} from '@/contexts/credit-policy/infrastructure/persistence/legal-maximum-rate.mapper';

type VersionedLegalMaximumRate = LegalMaximumRateColumns & { readonly version: number };

export class PrismaLegalMaximumRateRepository implements LegalMaximumRateRepository {
  constructor(
    private readonly database: Database,
    private readonly scope: ExecutionScope,
    private readonly clock: Clock,
  ) {}

  async findById(id: string): Promise<LegalMaximumRate | undefined> {
    // findFirst, not findUnique: the tenant is part of every condition, and it is not part of the key.
    const row = await this.database.client().creditPolicyLegalMaximumRate.findFirst({
      where: { id, ...tenantWhere(this.scope) },
    });

    return row === null ? undefined : LegalMaximumRateMapper.toDomain(row);
  }

  async findLatestOf(category: string): Promise<LegalMaximumRate | undefined> {
    const row = await this.database.client().creditPolicyLegalMaximumRate.findFirst({
      where: { category, ...tenantWhere(this.scope) },
      orderBy: { effectiveFrom: 'desc' },
    });

    return row === null ? undefined : LegalMaximumRateMapper.toDomain(row);
  }

  async save(saved: LegalMaximumRate): Promise<void> {
    await optimisticUpdate(saved, async ({ expected, next }) => {
      const state = { ...LegalMaximumRateMapper.toRow(saved), version: next };
      const written = expected === 0 ? await this.insert(state) : await this.update(state, expected);

      return written.count;
    });
  }

  /** The row is written in the tenant of the work: `tenantScopeOf` names it, `tenantWhere` finds it again. */
  private insert(state: VersionedLegalMaximumRate): Promise<{ count: number }> {
    const row = { ...state, ...tenantScopeOf(this.scope), ...stampCreation(this.scope, this.clock) };

    return this.database.client().creditPolicyLegalMaximumRate.createMany({ data: [row], skipDuplicates: true });
  }

  private update(state: VersionedLegalMaximumRate, expected: number): Promise<{ count: number }> {
    return this.database.client().creditPolicyLegalMaximumRate.updateMany({
      where: { id: state.id, version: expected, ...ownTenantWhere(this.scope) },
      data: { ...state, ...stampUpdate(this.scope, this.clock) },
    });
  }
}
