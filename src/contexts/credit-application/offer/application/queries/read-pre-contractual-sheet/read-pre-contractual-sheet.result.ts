/** The standard pre-contractual sheet of an offer, flat: the price and the cost of the credit in whole cents and basis points. */
export interface ReadPreContractualSheetResult {
  readonly offerId: string;
  readonly applicationId: string;
  readonly amountCents: number;
  readonly durationMonths: number;
  /** The nominal rate of the offer, in basis points of a year. */
  readonly rateBasisPoints: number;
  /** The annual percentage rate, stated to one decimal of a per cent: "6.4". */
  readonly annualPercentageRate: string;
  readonly instalmentCents: number;
  readonly arrangementFeeCents: number;
  /** What the borrower pays in all: the instalments and the arrangement fee. */
  readonly totalToRepayCents: number;
}
