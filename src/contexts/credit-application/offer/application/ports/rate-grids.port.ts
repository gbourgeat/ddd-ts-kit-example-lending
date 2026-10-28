import { ReadModelStore } from '@ddd-ts-kit/kernel';

/** One line of the rate grids read model: a grid credit-policy published for one product, with the day it takes effect. */
export type RateGridRow = {
  readonly rateGridId: string;
  readonly productId: string;
  /** The day the grid takes effect. */
  readonly effectiveFrom: Date;
};

/** The rate grids read model, kept from what credit-policy publishes: one line per grid. */
export abstract class RateGrids extends ReadModelStore<RateGridRow> {}
