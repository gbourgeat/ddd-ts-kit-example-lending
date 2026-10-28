import type { AuditStamp, TenantScoped } from '@ddd-ts-kit/kernel';
import { ImpactAssessment } from '@/contexts/data-protection/domain/aggregates/impact-assessment.aggregate';
import type { DataProtectionImpactAssessment as ImpactAssessmentRow } from '$generated/prisma/client';

export type ImpactAssessmentColumns = Omit<ImpactAssessmentRow, 'version' | keyof AuditStamp | keyof TenantScoped>;

export const ImpactAssessmentMapper = {
  toDomain(row: ImpactAssessmentRow): ImpactAssessment {
    const loaded = ImpactAssessment.rehydrate(row.id, {
      registeredAt: row.registeredAt,
      scoringModelVersion: row.scoringModelVersion,
      month: row.month,
    });

    loaded.version = row.version;

    return loaded;
  },

  toRow(saved: ImpactAssessment): ImpactAssessmentColumns {
    const { registeredAt, scoringModelVersion, month } = saved.toState();

    return { id: saved.id, registeredAt, scoringModelVersion, month };
  },
};
