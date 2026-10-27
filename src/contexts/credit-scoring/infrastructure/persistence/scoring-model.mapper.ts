import type { AuditStamp, TenantScoped } from '@ddd-ts-kit/kernel';
import { ScoringModel } from '@/contexts/credit-scoring/domain/aggregates/scoring-model.aggregate';
import type { CreditScoringScoringModel as ScoringModelRow } from '$generated/prisma/client';

export type ScoringModelColumns = Omit<ScoringModelRow, 'version' | keyof AuditStamp | keyof TenantScoped>;

export const ScoringModelMapper = {
  toDomain(row: ScoringModelRow): ScoringModel {
    // TODO(domain): rebuild each value object of ScoringModelState from its fields.
    const loaded = ScoringModel.rehydrate(row.id, { registeredAt: row.registeredAt });

    loaded.version = row.version;

    return loaded;
  },

  toRow(saved: ScoringModel): ScoringModelColumns {
    // TODO(domain): flatten each value object of ScoringModelState into its fields; nothing of the row type leaves this file.
    return { id: saved.id, ...saved.toState() };
  },
};
