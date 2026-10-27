import { stampCreation, stampUpdate, tenantScopeOf, type Clock, type ExecutionScope } from '@ddd-ts-kit/kernel';
import { optimisticUpdate, ownTenantWhere, tenantWhere } from '@ddd-ts-kit/prisma';
import type { SuspiciousActivityReport } from '@/contexts/financial-crime/domain/aggregates/suspicious-activity-report.aggregate';
import type { SuspiciousActivityReportRepository } from '@/contexts/financial-crime/domain/repositories/suspicious-activity-report.repository';
import type { Database } from '@/platform/database/database';
import {
  SuspiciousActivityReportMapper,
  type SuspiciousActivityReportColumns,
} from '@/contexts/financial-crime/infrastructure/persistence/suspicious-activity-report.mapper';

type VersionedSuspiciousActivityReport = SuspiciousActivityReportColumns & { readonly version: number };

export class PrismaSuspiciousActivityReportRepository implements SuspiciousActivityReportRepository {
  constructor(
    private readonly database: Database,
    private readonly scope: ExecutionScope,
    private readonly clock: Clock,
  ) {}

  async findById(id: string): Promise<SuspiciousActivityReport | undefined> {
    // findFirst, not findUnique: the tenant is part of every condition, and it is not part of the key.
    const row = await this.database.client().financialCrimeSuspiciousActivityReport.findFirst({
      where: { id, ...tenantWhere(this.scope) },
    });

    return row === null ? undefined : SuspiciousActivityReportMapper.toDomain(row);
  }

  async save(saved: SuspiciousActivityReport): Promise<void> {
    await optimisticUpdate(saved, async ({ expected, next }) => {
      const state = { ...SuspiciousActivityReportMapper.toRow(saved), version: next };
      const written = expected === 0 ? await this.insert(state) : await this.update(state, expected);

      return written.count;
    });
  }

  /** The row is written in the tenant of the work: `tenantScopeOf` names it, `tenantWhere` finds it again. */
  private insert(state: VersionedSuspiciousActivityReport): Promise<{ count: number }> {
    const row = { ...state, ...tenantScopeOf(this.scope), ...stampCreation(this.scope, this.clock) };

    return this.database
      .client()
      .financialCrimeSuspiciousActivityReport.createMany({ data: [row], skipDuplicates: true });
  }

  private update(state: VersionedSuspiciousActivityReport, expected: number): Promise<{ count: number }> {
    return this.database.client().financialCrimeSuspiciousActivityReport.updateMany({
      where: { id: state.id, version: expected, ...ownTenantWhere(this.scope) },
      data: { ...state, ...stampUpdate(this.scope, this.clock) },
    });
  }
}
