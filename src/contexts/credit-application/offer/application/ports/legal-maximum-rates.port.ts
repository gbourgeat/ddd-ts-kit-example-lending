import { ReadModelStore } from '@ddd-ts-kit/kernel';

/** One line of the legal maximum rates read model: the maximum a category may charge, from the day it takes effect. */
export type LegalMaximumRateRow = {
  readonly legalMaximumRateId: string;
  readonly category: string;
  /** The legal maximum of the category, in basis points of a year (1 point = 0.01 percent). */
  readonly rateBasisPoints: number;
  /** The day the maximum takes effect. */
  readonly effectiveFrom: Date;
};

/** The legal maximum rates read model, kept from what credit-policy publishes: one line per maximum, every version kept. */
export abstract class LegalMaximumRates extends ReadModelStore<LegalMaximumRateRow> {}
