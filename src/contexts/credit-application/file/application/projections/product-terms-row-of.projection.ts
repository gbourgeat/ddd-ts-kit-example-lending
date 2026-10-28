import type { ProductDefinedV2 } from '@/contexts/credit-policy/published-language';
import type { ProductTermsRow } from '@/contexts/credit-application/file/application/ports/product-terms.port';

/** The row of the product terms read model that credit-policy's announcement describes. */
export function productTermsRowOf(payload: ProductDefinedV2['payload']): ProductTermsRow {
  return {
    productId: payload.productId,
    amountMinimumCents: payload.amountMinimumCents,
    amountMaximumCents: payload.amountMaximumCents,
    durationMinimumMonths: payload.durationMinimumMonths,
    durationMaximumMonths: payload.durationMaximumMonths,
    arrangementFeeCents: payload.arrangementFeeCents,
    insuranceMandatory: payload.insuranceMandatory,
  };
}
