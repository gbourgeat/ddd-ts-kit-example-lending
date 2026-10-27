import type { AuditStamp, TenantScoped } from '@ddd-ts-kit/kernel';
import {
  DelegationTable,
  type DelegationLimitState,
} from '@/contexts/credit-policy/domain/aggregates/delegation-table.aggregate';
import type { CreditPolicyDelegationTable as DelegationTableRow } from '$generated/prisma/client';

/** The levels column holds the limits of the four levels as a JSON array, one object per level. */
export type DelegationLevelsColumn = { level: string; amountCents: number }[];

export type DelegationTableColumns = Omit<
  DelegationTableRow,
  'levels' | 'version' | keyof AuditStamp | keyof TenantScoped
> & {
  readonly levels: DelegationLevelsColumn;
};

export const DelegationTableMapper = {
  toDomain(row: DelegationTableRow): DelegationTable {
    const loaded = DelegationTable.rehydrate(row.id, {
      registeredAt: row.registeredAt,
      effectiveFrom: row.effectiveFrom,
      levels: row.levels as DelegationLevelsColumn,
    });

    loaded.version = row.version;

    return loaded;
  },

  toRow(saved: DelegationTable): DelegationTableColumns {
    const state = saved.toState();

    return {
      id: saved.id,
      registeredAt: state.registeredAt,
      effectiveFrom: state.effectiveFrom,
      levels: state.levels.map((limit: DelegationLimitState) => ({
        level: limit.level,
        amountCents: limit.amountCents,
      })),
    };
  },
};
