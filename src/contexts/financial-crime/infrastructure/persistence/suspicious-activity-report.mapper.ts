import type { AuditStamp, TenantScoped } from '@ddd-ts-kit/kernel';
import { SuspiciousActivityReport } from '@/contexts/financial-crime/domain/aggregates/suspicious-activity-report.aggregate';
import type { FinancialCrimeSuspiciousActivityReport as SuspiciousActivityReportRow } from '$generated/prisma/client';

export type SuspiciousActivityReportColumns = Omit<
  SuspiciousActivityReportRow,
  'version' | keyof AuditStamp | keyof TenantScoped
>;

export const SuspiciousActivityReportMapper = {
  toDomain(row: SuspiciousActivityReportRow): SuspiciousActivityReport {
    const loaded = SuspiciousActivityReport.rehydrate(row.id, {
      registeredAt: row.registeredAt,
      subjectReference: row.subjectReference,
    });

    loaded.version = row.version;

    return loaded;
  },

  toRow(saved: SuspiciousActivityReport): SuspiciousActivityReportColumns {
    return { id: saved.id, ...saved.toState() };
  },
};
