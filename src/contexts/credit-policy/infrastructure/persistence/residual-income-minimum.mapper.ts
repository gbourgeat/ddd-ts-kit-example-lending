import type { AuditStamp, TenantScoped } from '@ddd-ts-kit/kernel';
import { ResidualIncomeMinimum } from '@/contexts/credit-policy/domain/aggregates/residual-income-minimum.aggregate';
import type { CreditPolicyResidualIncomeMinimum as ResidualIncomeMinimumRow } from '$generated/prisma/client';

export type ResidualIncomeMinimumColumns = Omit<
  ResidualIncomeMinimumRow,
  'version' | keyof AuditStamp | keyof TenantScoped
>;

export const ResidualIncomeMinimumMapper = {
  toDomain(row: ResidualIncomeMinimumRow): ResidualIncomeMinimum {
    const loaded = ResidualIncomeMinimum.rehydrate(row.id, {
      registeredAt: row.registeredAt,
      perAdultInCents: row.perAdultInCents,
      perChildInCents: row.perChildInCents,
      effectiveFrom: row.effectiveFrom,
    });

    loaded.version = row.version;

    return loaded;
  },

  toRow(saved: ResidualIncomeMinimum): ResidualIncomeMinimumColumns {
    return { id: saved.id, ...saved.toState() };
  },
};
