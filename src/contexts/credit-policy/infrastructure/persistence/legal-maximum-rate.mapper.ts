import type { AuditStamp, TenantScoped } from '@ddd-ts-kit/kernel';
import { LegalMaximumRate } from '@/contexts/credit-policy/domain/aggregates/legal-maximum-rate.aggregate';
import type { CreditPolicyLegalMaximumRate as LegalMaximumRateRow } from '$generated/prisma/client';

export type LegalMaximumRateColumns = Omit<LegalMaximumRateRow, 'version' | keyof AuditStamp | keyof TenantScoped>;

export const LegalMaximumRateMapper = {
  toDomain(row: LegalMaximumRateRow): LegalMaximumRate {
    const loaded = LegalMaximumRate.rehydrate(row.id, {
      registeredAt: row.registeredAt,
      category: row.category,
      effectiveFrom: row.effectiveFrom,
    });

    loaded.version = row.version;

    return loaded;
  },

  toRow(saved: LegalMaximumRate): LegalMaximumRateColumns {
    return { id: saved.id, ...saved.toState() };
  },
};
