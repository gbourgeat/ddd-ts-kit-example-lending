/** What the bank charges: the rate grids and the legal maximum rates in force on a day, read from what credit-policy published. */
export abstract class OfferPricing {
  /** The rate, in basis points of a year, of the grid in force on `day` for the product and the duration, or undefined when none prices it. */
  abstract rateBasisPointsFor(productId: string, durationMonths: number, day: Date): Promise<number | undefined>;

  /** The legal maximum rate, in basis points of a year, in force on `day` for the category of the loan, or undefined when none is known. */
  abstract legalMaximumBasisPointsFor(category: string, day: Date): Promise<number | undefined>;
}
