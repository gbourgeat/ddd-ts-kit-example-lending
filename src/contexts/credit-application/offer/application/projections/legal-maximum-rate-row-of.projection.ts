import type { LegalMaximumRatePublishedV2 } from '@/contexts/credit-policy/published-language';
import type { LegalMaximumRateRow } from '@/contexts/credit-application/offer/application/ports/legal-maximum-rates.port';

/** The row of the legal maximum rates read model that credit-policy's announcement describes. */
export function legalMaximumRateRowOf(payload: LegalMaximumRatePublishedV2['payload']): LegalMaximumRateRow {
  return {
    legalMaximumRateId: payload.legalMaximumRateId,
    category: payload.category,
    rateBasisPoints: payload.rateBasisPoints,
    effectiveFrom: new Date(payload.effectiveFrom),
  };
}
