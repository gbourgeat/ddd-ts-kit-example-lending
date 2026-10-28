import type { RateBand } from '@/contexts/credit-application/offer/application/ports/rate-grids.port';

/** A rate grid as a decider reads it: the product it is for, and the day it takes effect. */
export interface ReadRateGridResult {
  readonly rateGridId: string;
  readonly productId: string;
  /** The day the grid takes effect, as an ISO 8601 instant. */
  readonly effectiveFrom: string;
  /** The bands of the grid: the rate of a credit lasting up to so many months. */
  readonly rates: readonly RateBand[];
}
