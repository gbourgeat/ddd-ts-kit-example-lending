import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

export class ProductDefined extends NamedDomainEvent('credit-policy.product.defined') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
  ) {
    super();
  }
}
