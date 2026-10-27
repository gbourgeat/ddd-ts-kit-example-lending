import type { AuditStamp, TenantScoped } from '@ddd-ts-kit/kernel';
import { DelegationTable } from '@/contexts/credit-policy/domain/aggregates/delegation-table.aggregate';
import type { CreditPolicyDelegationTable as DelegationTableRow } from '$generated/prisma/client';

export type DelegationTableColumns = Omit<DelegationTableRow, 'version' | keyof AuditStamp | keyof TenantScoped>;

export const DelegationTableMapper = {
  toDomain(row: DelegationTableRow): DelegationTable {
    const loaded = DelegationTable.rehydrate(row.id, {
      registeredAt: row.registeredAt,
      effectiveFrom: row.effectiveFrom,
    });

    loaded.version = row.version;

    return loaded;
  },

  toRow(saved: DelegationTable): DelegationTableColumns {
    return { id: saved.id, ...saved.toState() };
  },
};
