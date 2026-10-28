import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

/** A grid is published for a product with its day of effect and its bands: the rate, in basis points of a year, of a credit lasting up to this many months. */
export class RateGridPublished extends NamedDomainEvent('credit-policy.rate-grid.published') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    readonly publication: {
      readonly productId: string;
      readonly effectiveFrom: Date;
      readonly rates: readonly { readonly upToMonths: number; readonly rateBasisPoints: number }[];
    },
  ) {
    super();
  }
}
