import type { AuditStamp, TenantScoped } from '@ddd-ts-kit/kernel';
import { ImpactAssessment } from '@/contexts/data-protection/domain/aggregates/impact-assessment.aggregate';
import type { DataProtectionImpactAssessment as ImpactAssessmentRow } from '$generated/prisma/client';

export type ImpactAssessmentColumns = Omit<ImpactAssessmentRow, 'version' | keyof AuditStamp | keyof TenantScoped>;

export const ImpactAssessmentMapper = {
  toDomain(row: ImpactAssessmentRow): ImpactAssessment {
    // TODO(domain): rebuild each value object of ImpactAssessmentState from its fields.
    const loaded = ImpactAssessment.rehydrate(row.id, { registeredAt: row.registeredAt });

    loaded.version = row.version;

    return loaded;
  },

  toRow(saved: ImpactAssessment): ImpactAssessmentColumns {
    // TODO(domain): flatten each value object of ImpactAssessmentState into its fields; nothing of the row type leaves this file.
    return { id: saved.id, ...saved.toState() };
  },
};
