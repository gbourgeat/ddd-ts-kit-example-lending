import type { AuditStamp, TenantScoped } from '@ddd-ts-kit/kernel';
import { ScoringModel } from '@/contexts/credit-scoring/domain/aggregates/scoring-model.aggregate';
import { ScoringModelVersion } from '@/contexts/credit-scoring/domain/entities/scoring-model-version.entity';
import type { RiskLevel } from '@/contexts/credit-scoring/domain/vocabularies/risk-level.vocabulary';
import type { CreditScoringScoringModel as ScoringModelRow } from '$generated/prisma/client';

export type ScoringModelColumns = Omit<
  ScoringModelRow,
  'version' | 'versions' | keyof AuditStamp | keyof TenantScoped
> & {
  versions: StoredVersion[];
};

/** One version as the `versions` column keeps it: JSON, with the instant as an ISO 8601 text. */
type StoredVersion = {
  readonly id: string;
  readonly number: number;
  readonly modelRisk: RiskLevel;
  readonly label: string;
  readonly publishedAt: string;
};

export const ScoringModelMapper = {
  toDomain(row: ScoringModelRow): ScoringModel {
    const versions = (row.versions as unknown as readonly StoredVersion[]).map((stored) =>
      ScoringModelVersion.rehydrate(stored.id, {
        number: stored.number,
        modelRisk: stored.modelRisk,
        label: stored.label,
        publishedAt: new Date(stored.publishedAt),
      }),
    );

    const loaded = ScoringModel.rehydrate(row.id, { registeredAt: row.registeredAt, versions });

    loaded.version = row.version;

    return loaded;
  },

  toRow(saved: ScoringModel): ScoringModelColumns {
    const versions: StoredVersion[] = saved.versions.map((version) => {
      const state = version.toState();

      return {
        id: version.id,
        number: state.number,
        modelRisk: state.modelRisk,
        label: state.label,
        publishedAt: state.publishedAt.toISOString(),
      };
    });

    return { id: saved.id, registeredAt: saved.registeredAt, versions };
  },
};
