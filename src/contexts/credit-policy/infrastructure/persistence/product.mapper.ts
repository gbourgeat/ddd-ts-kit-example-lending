import type { AuditStamp, TenantScoped } from '@ddd-ts-kit/kernel';
import { Product } from '@/contexts/credit-policy/domain/aggregates/product.aggregate';
import type { CreditPolicyProduct as ProductRow } from '$generated/prisma/client';

export type ProductColumns = Omit<ProductRow, 'version' | keyof AuditStamp | keyof TenantScoped>;

export const ProductMapper = {
  toDomain(row: ProductRow): Product {
    const loaded = Product.rehydrate(row.id, {
      registeredAt: row.registeredAt,
      amountMinimumCents: row.amountMinimumCents,
      amountMaximumCents: row.amountMaximumCents,
      durationMinimumMonths: row.durationMinimumMonths,
      durationMaximumMonths: row.durationMaximumMonths,
      arrangementFeeCents: row.arrangementFeeCents,
      insuranceMandatory: row.insuranceMandatory,
      scoreThreshold: row.scoreThreshold,
    });

    loaded.version = row.version;

    return loaded;
  },

  toRow(saved: Product): ProductColumns {
    return { id: saved.id, ...saved.toState() };
  },
};
