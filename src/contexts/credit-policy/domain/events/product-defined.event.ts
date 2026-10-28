import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

export class ProductDefined extends NamedDomainEvent('credit-policy.product.defined') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    readonly terms: {
      readonly amountMinimumCents: number;
      readonly amountMaximumCents: number;
      readonly durationMinimumMonths: number;
      readonly durationMaximumMonths: number;
      readonly arrangementFeeCents: number;
      readonly insuranceMandatory: boolean;
    },
  ) {
    super();
  }
}
