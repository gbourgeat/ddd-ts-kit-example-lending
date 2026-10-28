/** The portfolio at risk of the tenant: the open loans per arrears bucket, their principal and the share at risk. */
export interface ReadPortfolioAtRiskResult {
  /** One line per arrears bucket, in the order of the vocabulary, `None` included: the open loans in it. */
  readonly buckets: readonly { readonly bucket: string; readonly loans: number; readonly principalCents: number }[];
  /** The principal of the open loans, in whole cents. */
  readonly openPrincipalCents: number;
  /** The principal of the open loans 31 days past due and over, over the open principal, in basis points, rounded down; zero when no loan is open. */
  readonly atRiskBasisPoints: number;
}
