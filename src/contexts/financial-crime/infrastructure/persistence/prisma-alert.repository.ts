import { stampCreation, stampUpdate, tenantScopeOf, type Clock, type ExecutionScope } from '@ddd-ts-kit/kernel';
import { optimisticUpdate, ownTenantWhere, tenantWhere } from '@ddd-ts-kit/prisma';
import type { Alert } from '@/contexts/financial-crime/domain/aggregates/alert.aggregate';
import type { AlertRepository } from '@/contexts/financial-crime/domain/repositories/alert.repository';
import type { Database } from '@/platform/database/database';
import { AlertMapper, type AlertColumns } from '@/contexts/financial-crime/infrastructure/persistence/alert.mapper';

type VersionedAlert = AlertColumns & { readonly version: number };

export class PrismaAlertRepository implements AlertRepository {
  constructor(
    private readonly database: Database,
    private readonly scope: ExecutionScope,
    private readonly clock: Clock,
  ) {}

  async findById(id: string): Promise<Alert | undefined> {
    // findFirst, not findUnique: the tenant is part of every condition, and it is not part of the key.
    const row = await this.database.client().financialCrimeAlert.findFirst({
      where: { id, ...tenantWhere(this.scope) },
    });

    return row === null ? undefined : AlertMapper.toDomain(row);
  }

  async save(saved: Alert): Promise<void> {
    await optimisticUpdate(saved, async ({ expected, next }) => {
      const state = { ...AlertMapper.toRow(saved), version: next };
      const written = expected === 0 ? await this.insert(state) : await this.update(state, expected);

      return written.count;
    });
  }

  /** The row is written in the tenant of the work: `tenantScopeOf` names it, `tenantWhere` finds it again. */
  private insert(state: VersionedAlert): Promise<{ count: number }> {
    const row = { ...state, ...tenantScopeOf(this.scope), ...stampCreation(this.scope, this.clock) };

    return this.database.client().financialCrimeAlert.createMany({ data: [row], skipDuplicates: true });
  }

  private update(state: VersionedAlert, expected: number): Promise<{ count: number }> {
    return this.database.client().financialCrimeAlert.updateMany({
      where: { id: state.id, version: expected, ...ownTenantWhere(this.scope) },
      data: { ...state, ...stampUpdate(this.scope, this.clock) },
    });
  }
}
