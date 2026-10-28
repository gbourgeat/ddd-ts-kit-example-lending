import type { RateGridPublishedV2 } from '@/contexts/credit-policy/published-language';
import type { RateGridRow } from '@/contexts/credit-application/offer/application/ports/rate-grids.port';

/** The row of the rate grids read model that credit-policy's announcement describes. */
export function rateGridRowOf(payload: RateGridPublishedV2['payload']): RateGridRow {
  return {
    rateGridId: payload.rateGridId,
    productId: payload.productId,
    effectiveFrom: new Date(payload.effectiveFrom),
    rates: payload.rates.map((band) => ({ upToMonths: band.upToMonths, rateBasisPoints: band.rateBasisPoints })),
  };
}
