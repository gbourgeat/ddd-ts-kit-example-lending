import { ReadModelStore } from '@ddd-ts-kit/kernel';

/** One band of a grid: the rate, in basis points of a year, of a credit lasting up to this many months. */
export type RateBand = {
  readonly upToMonths: number;
  readonly rateBasisPoints: number;
};

/** One line of the rate grids read model: a grid credit-policy published for one product, with the day it takes effect. */
export type RateGridRow = {
  readonly rateGridId: string;
  readonly productId: string;
  /** The day the grid takes effect. */
  readonly effectiveFrom: Date;
  /** The bands of the grid, the rate of a credit lasting up to so many months. */
  readonly rates: readonly RateBand[];
};

/** The rate grids read model, kept from what credit-policy publishes: one line per grid. */
export abstract class RateGrids extends ReadModelStore<RateGridRow> {}
