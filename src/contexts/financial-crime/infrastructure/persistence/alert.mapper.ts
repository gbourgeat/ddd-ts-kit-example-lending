import type { AuditStamp, TenantScoped } from '@ddd-ts-kit/kernel';
import { Alert } from '@/contexts/financial-crime/domain/aggregates/alert.aggregate';
import type { FinancialCrimeAlert as AlertRow } from '$generated/prisma/client';

export type AlertColumns = Omit<AlertRow, 'version' | keyof AuditStamp | keyof TenantScoped>;

export const AlertMapper = {
  toDomain(row: AlertRow): Alert {
    const loaded = Alert.rehydrate(row.id, {
      registeredAt: row.registeredAt,
      repaymentReference: row.repaymentReference,
      closedAt: row.closedAt ?? undefined,
      closureReason: row.closureReason ?? undefined,
    });

    loaded.version = row.version;

    return loaded;
  },

  toRow(saved: Alert): AlertColumns {
    return {
      id: saved.id,
      registeredAt: saved.registeredAt,
      repaymentReference: saved.repaymentReference,
      closedAt: saved.closedAt ?? null,
      closureReason: saved.closureReason ?? null,
    };
  },
};
