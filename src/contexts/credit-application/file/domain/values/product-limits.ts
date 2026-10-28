/** The limits a product sets on the amount, in cents, and on the duration, in months, of a request. */
export interface ProductLimits {
  readonly amountMinimumCents: number;
  readonly amountMaximumCents: number;
  readonly durationMinimumMonths: number;
  readonly durationMaximumMonths: number;
}
