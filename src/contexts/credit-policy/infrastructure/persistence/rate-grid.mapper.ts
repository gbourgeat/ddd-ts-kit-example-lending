import type { AuditStamp, TenantScoped } from '@ddd-ts-kit/kernel';
import { RateGrid } from '@/contexts/credit-policy/domain/aggregates/rate-grid.aggregate';
import type { CreditPolicyRateGrid as RateGridRow } from '$generated/prisma/client';

/** The rates column holds the bands of the grid as a JSON array, one object per band. */
export type RatesColumn = { upToMonths: number; rateBasisPoints: number }[];

export type RateGridColumns = Omit<RateGridRow, 'rates' | 'version' | keyof AuditStamp | keyof TenantScoped> & {
  readonly rates: RatesColumn;
};

export const RateGridMapper = {
  toDomain(row: RateGridRow): RateGrid {
    const loaded = RateGrid.rehydrate(row.id, {
      registeredAt: row.registeredAt,
      productId: row.productId,
      effectiveFrom: row.effectiveFrom,
      rates: row.rates as RatesColumn,
    });

    loaded.version = row.version;

    return loaded;
  },

  toRow(saved: RateGrid): RateGridColumns {
    const state = saved.toState();

    return { id: saved.id, ...state, rates: state.rates.map((band) => ({ ...band })) };
  },
};
