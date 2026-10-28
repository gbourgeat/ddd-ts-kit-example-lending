import { ReadModelStore } from '@ddd-ts-kit/kernel';

/** One line of the product terms read model: the terms credit-policy defined for one product. */
export type ProductTermsRow = {
  readonly productId: string;
  readonly amountMinimumCents: number;
  readonly amountMaximumCents: number;
  readonly durationMinimumMonths: number;
  readonly durationMaximumMonths: number;
  readonly arrangementFeeCents: number;
  readonly insuranceMandatory: boolean;
};

/** The product terms read model, kept from what credit-policy publishes: one line per product. */
export abstract class ProductTerms extends ReadModelStore<ProductTermsRow> {}
