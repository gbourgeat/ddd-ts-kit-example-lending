import { ownTenantWhere, tenantWhere } from '@ddd-ts-kit/prisma';
import { tenantScopeOf, type EventStamp, type ExecutionScope } from '@ddd-ts-kit/kernel';
import type { DeclaredConflictRow } from '@/contexts/credit-application/decision/application/read-model/declared-conflict-row';
import type { DeclaredConflictsStore } from '@/contexts/credit-application/decision/application/ports/declared-conflicts-store.port';
import { DeclaredConflictMapper } from '@/contexts/credit-application/decision/infrastructure/persistence/declared-conflict.mapper';
import type { Database } from '@/platform/database/database';

/** The declared conflicts read model in its table: a line is written only when its event is not older than the one it holds. */
export class PrismaDeclaredConflictsStore implements DeclaredConflictsStore {
  constructor(
    private readonly database: Database,
    private readonly scope: ExecutionScope,
  ) {}

  async keep(row: DeclaredConflictRow, stamp: EventStamp): Promise<void> {
    const current = await this.database.client().creditApplicationDeclaredConflict.findFirst({
      where: { id: row.conflictOfInterestId, ...tenantWhere(this.scope) },
    });

    if (current) {
      await this.update(row, stamp);
    } else {
      await this.database.client().creditApplicationDeclaredConflict.createMany({
        data: [
          {
            id: row.conflictOfInterestId,
            staffMemberId: row.staffMemberId,
            customerId: row.customerId,
            occurredAt: stamp.occurredAt,
            ...tenantScopeOf(this.scope),
          },
        ],
        skipDuplicates: true,
      });
    }
  }

  async find(conflictOfInterestId: string): Promise<DeclaredConflictRow | undefined> {
    const record = await this.database.client().creditApplicationDeclaredConflict.findFirst({
      where: { id: conflictOfInterestId, ...tenantWhere(this.scope) },
    });

    return record ? new DeclaredConflictMapper().toRow(record) : undefined;
  }

  private async update(row: DeclaredConflictRow, stamp: EventStamp): Promise<void> {
    await this.database.client().creditApplicationDeclaredConflict.updateMany({
      where: { id: row.conflictOfInterestId, occurredAt: { lte: stamp.occurredAt }, ...ownTenantWhere(this.scope) },
      data: { staffMemberId: row.staffMemberId, customerId: row.customerId, occurredAt: stamp.occurredAt },
    });
  }
}
