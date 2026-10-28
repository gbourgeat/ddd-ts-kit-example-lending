/** One band of a grid: the rate of a credit lasting up to so many months. */
export interface RateBandOf {
  readonly upToMonths: number;
  readonly rateBasisPoints: number;
}

/** Reads a price in a grid and a maximum in force on a day; both are data of the bank with a date of effect, never constants. */
export class RateGridService {
  /** The rate of the shortest band that covers the duration, or undefined when the duration is beyond the grid. */
  bandRateOf(bands: readonly RateBandOf[], durationMonths: number): number | undefined {
    const covering = bands.filter((band) => band.upToMonths >= durationMonths);
    const shortest = [...covering].sort((first, second) => first.upToMonths - second.upToMonths)[0];

    return shortest?.rateBasisPoints;
  }

  /** The entry in force on `day`: the latest whose date of effect is not after it. */
  inForceOn<Entry extends { readonly effectiveFrom: Date }>(entries: readonly Entry[], day: Date): Entry | undefined {
    const applicable = entries.filter((entry) => entry.effectiveFrom.getTime() <= day.getTime());

    return [...applicable].sort((first, second) => second.effectiveFrom.getTime() - first.effectiveFrom.getTime())[0];
  }
}
