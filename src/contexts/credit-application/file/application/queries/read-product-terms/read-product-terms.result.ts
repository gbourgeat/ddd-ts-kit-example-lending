/** The terms of a product as a decider reads them: the amounts, durations, fee and insurance of the product. */
export interface ReadProductTermsResult {
  readonly productId: string;
  readonly amountMinimumCents: number;
  readonly amountMaximumCents: number;
  readonly durationMinimumMonths: number;
  readonly durationMaximumMonths: number;
  readonly arrangementFeeCents: number;
  readonly insuranceMandatory: boolean;
}
