import type { AuditStamp, TenantScoped } from '@ddd-ts-kit/kernel';
import { Offer } from '@/contexts/credit-application/offer/domain/aggregates/offer.aggregate';
import type { CreditApplicationOffer as OfferRow } from '$generated/prisma/client';

export type OfferColumns = Omit<OfferRow, 'version' | keyof AuditStamp | keyof TenantScoped>;

export const OfferMapper = {
  toDomain(row: OfferRow): Offer {
    const loaded = Offer.rehydrate(row.id, {
      registeredAt: row.registeredAt,
      issuedAt: row.issuedAt ?? undefined,
      signedAt: row.signedAt ?? undefined,
      terms: {
        applicationId: row.applicationId,
        amountCents: row.amountCents,
        durationMonths: row.durationMonths,
        rateBasisPoints: row.rateBasisPoints,
        annualPercentageRateTenths: row.annualPercentageRateTenths,
        instalmentCents: row.instalmentCents,
        arrangementFeeCents: row.arrangementFeeCents,
        legalMaximumBasisPoints: row.legalMaximumBasisPoints,
      },
    });

    loaded.version = row.version;

    return loaded;
  },

  toRow(saved: Offer): OfferColumns {
    const { registeredAt, issuedAt, signedAt, terms } = saved.toState();

    return { id: saved.id, registeredAt, issuedAt: issuedAt ?? null, signedAt: signedAt ?? null, ...terms };
  },
};
