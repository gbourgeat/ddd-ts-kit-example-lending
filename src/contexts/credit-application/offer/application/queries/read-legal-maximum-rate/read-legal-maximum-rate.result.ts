/** A legal maximum rate as a decider reads it: the category, the maximum in basis points, and the day it takes effect. */
export interface ReadLegalMaximumRateResult {
  readonly legalMaximumRateId: string;
  readonly category: string;
  /** The legal maximum of the category, in basis points of a year. */
  readonly rateBasisPoints: number;
  /** The day the maximum takes effect, as an ISO 8601 instant. */
  readonly effectiveFrom: string;
}
