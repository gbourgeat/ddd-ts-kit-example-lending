export interface SearchProductCatalogueResult {
  readonly products: readonly {
    readonly id: string;
    readonly amountMinimumCents: number;
    readonly amountMaximumCents: number;
    readonly durationMinimumMonths: number;
    readonly durationMaximumMonths: number;
    readonly arrangementFeeCents: number;
    readonly insuranceMandatory: boolean;
  }[];
}
