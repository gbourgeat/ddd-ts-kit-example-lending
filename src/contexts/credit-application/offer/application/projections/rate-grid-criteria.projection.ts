import { defineCriteria } from '@ddd-ts-kit/kernel';
import type { RateGridRow } from '@/contexts/credit-application/offer/application/ports/rate-grids.port';

/** What a read of the rate grids read model may filter by. */
export const rateGridCriteria = defineCriteria<RateGridRow>({
  fields: {
    rateGridId: { type: 'string', filter: ['eq'] },
  },
  tieBreaker: 'rateGridId',
});
