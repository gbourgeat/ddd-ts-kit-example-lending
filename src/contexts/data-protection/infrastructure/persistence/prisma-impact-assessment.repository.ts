import { stampCreation, stampUpdate, tenantScopeOf, type Clock, type ExecutionScope } from '@ddd-ts-kit/kernel';
import { optimisticUpdate, ownTenantWhere, tenantWhere } from '@ddd-ts-kit/prisma';
import type { ImpactAssessment } from '@/contexts/data-protection/domain/aggregates/impact-assessment.aggregate';
import type { ImpactAssessmentRepository } from '@/contexts/data-protection/domain/repositories/impact-assessment.repository';
import type { Database } from '@/platform/database/database';
import {
  ImpactAssessmentMapper,
  type ImpactAssessmentColumns,
} from '@/contexts/data-protection/infrastructure/persistence/impact-assessment.mapper';

type VersionedImpactAssessment = ImpactAssessmentColumns & { readonly version: number };

export class PrismaImpactAssessmentRepository implements ImpactAssessmentRepository {
  constructor(
    private readonly database: Database,
    private readonly scope: ExecutionScope,
    private readonly clock: Clock,
  ) {}

  async findById(id: string): Promise<ImpactAssessment | undefined> {
    // findFirst, not findUnique: the tenant is part of every condition, and it is not part of the key.
    const row = await this.database.client().dataProtectionImpactAssessment.findFirst({
      where: { id, ...tenantWhere(this.scope) },
    });

    return row === null ? undefined : ImpactAssessmentMapper.toDomain(row);
  }

  async save(saved: ImpactAssessment): Promise<void> {
    await optimisticUpdate(saved, async ({ expected, next }) => {
      const state = { ...ImpactAssessmentMapper.toRow(saved), version: next };
      const written = expected === 0 ? await this.insert(state) : await this.update(state, expected);

      return written.count;
    });
  }

  /** The row is written in the tenant of the work: `tenantScopeOf` names it, `tenantWhere` finds it again. */
  private insert(state: VersionedImpactAssessment): Promise<{ count: number }> {
    const row = { ...state, ...tenantScopeOf(this.scope), ...stampCreation(this.scope, this.clock) };

    return this.database.client().dataProtectionImpactAssessment.createMany({ data: [row], skipDuplicates: true });
  }

  private update(state: VersionedImpactAssessment, expected: number): Promise<{ count: number }> {
    return this.database.client().dataProtectionImpactAssessment.updateMany({
      where: { id: state.id, version: expected, ...ownTenantWhere(this.scope) },
      data: { ...state, ...stampUpdate(this.scope, this.clock) },
    });
  }
}
