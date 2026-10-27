import type { AuditStamp, TenantScoped } from '@ddd-ts-kit/kernel';
import { RetentionPeriod } from '@/contexts/data-protection/domain/aggregates/retention-period.aggregate';
import type { DataProtectionRetentionPeriod as RetentionPeriodRow } from '$generated/prisma/client';

export type RetentionPeriodColumns = Omit<RetentionPeriodRow, 'version' | keyof AuditStamp | keyof TenantScoped>;

export const RetentionPeriodMapper = {
  toDomain(row: RetentionPeriodRow): RetentionPeriod {
    const loaded = RetentionPeriod.rehydrate(row.id, {
      registeredAt: row.registeredAt,
      contextName: row.contextName,
      kindOfData: row.kindOfData,
      durationInMonths: row.durationInMonths,
    });

    loaded.version = row.version;

    return loaded;
  },

  toRow(saved: RetentionPeriod): RetentionPeriodColumns {
    return { id: saved.id, ...saved.toState() };
  },
};
