import type { AuditStamp, TenantScoped } from '@ddd-ts-kit/kernel';
import { Offer } from '@/contexts/credit-application/offer/domain/aggregates/offer.aggregate';
import type { CreditApplicationOffer as OfferRow } from '$generated/prisma/client';

export type OfferColumns = Omit<OfferRow, 'version' | keyof AuditStamp | keyof TenantScoped>;

export const OfferMapper = {
  toDomain(row: OfferRow): Offer {
    // TODO(domain): rebuild each value object of OfferState from its fields.
    const loaded = Offer.rehydrate(row.id, { registeredAt: row.registeredAt });

    loaded.version = row.version;

    return loaded;
  },

  toRow(saved: Offer): OfferColumns {
    // TODO(domain): flatten each value object of OfferState into its fields; nothing of the row type leaves this file.
    return { id: saved.id, ...saved.toState() };
  },
};
