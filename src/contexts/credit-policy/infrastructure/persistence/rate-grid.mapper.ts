import type { AuditStamp, TenantScoped } from '@ddd-ts-kit/kernel';
import { RateGrid } from '@/contexts/credit-policy/domain/aggregates/rate-grid.aggregate';
import type { CreditPolicyRateGrid as RateGridRow } from '$generated/prisma/client';

export type RateGridColumns = Omit<RateGridRow, 'version' | keyof AuditStamp | keyof TenantScoped>;

export const RateGridMapper = {
  toDomain(row: RateGridRow): RateGrid {
    const loaded = RateGrid.rehydrate(row.id, {
      registeredAt: row.registeredAt,
      productId: row.productId,
      effectiveFrom: row.effectiveFrom,
    });

    loaded.version = row.version;

    return loaded;
  },

  toRow(saved: RateGrid): RateGridColumns {
    return { id: saved.id, ...saved.toState() };
  },
};
