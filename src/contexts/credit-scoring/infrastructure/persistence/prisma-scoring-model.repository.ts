import { stampCreation, stampUpdate, tenantScopeOf, type Clock, type ExecutionScope } from '@ddd-ts-kit/kernel';
import { optimisticUpdate, ownTenantWhere, tenantWhere } from '@ddd-ts-kit/prisma';
import type { ScoringModel } from '@/contexts/credit-scoring/domain/aggregates/scoring-model.aggregate';
import type { ScoringModelRepository } from '@/contexts/credit-scoring/domain/repositories/scoring-model.repository';
import type { Database } from '@/platform/database/database';
import {
  ScoringModelMapper,
  type ScoringModelColumns,
} from '@/contexts/credit-scoring/infrastructure/persistence/scoring-model.mapper';

type VersionedScoringModel = ScoringModelColumns & { readonly version: number };

export class PrismaScoringModelRepository implements ScoringModelRepository {
  constructor(
    private readonly database: Database,
    private readonly scope: ExecutionScope,
    private readonly clock: Clock,
  ) {}

  async findById(id: string): Promise<ScoringModel | undefined> {
    // findFirst, not findUnique: the tenant is part of every condition, and it is not part of the key.
    const row = await this.database.client().creditScoringScoringModel.findFirst({
      where: { id, ...tenantWhere(this.scope) },
    });

    return row === null ? undefined : ScoringModelMapper.toDomain(row);
  }

  async save(saved: ScoringModel): Promise<void> {
    await optimisticUpdate(saved, async ({ expected, next }) => {
      const state = { ...ScoringModelMapper.toRow(saved), version: next };
      const written = expected === 0 ? await this.insert(state) : await this.update(state, expected);

      return written.count;
    });
  }

  /** The row is written in the tenant of the work: `tenantScopeOf` names it, `tenantWhere` finds it again. */
  private insert(state: VersionedScoringModel): Promise<{ count: number }> {
    const row = { ...state, ...tenantScopeOf(this.scope), ...stampCreation(this.scope, this.clock) };

    return this.database.client().creditScoringScoringModel.createMany({ data: [row], skipDuplicates: true });
  }

  private update(state: VersionedScoringModel, expected: number): Promise<{ count: number }> {
    return this.database.client().creditScoringScoringModel.updateMany({
      where: { id: state.id, version: expected, ...ownTenantWhere(this.scope) },
      data: { ...state, ...stampUpdate(this.scope, this.clock) },
    });
  }
}
