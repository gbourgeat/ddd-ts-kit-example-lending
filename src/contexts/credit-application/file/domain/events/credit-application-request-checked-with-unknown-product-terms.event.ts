import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

/** The check of the application found the terms of its product not kept yet: the request could not be compared with them. */
export class CreditApplicationRequestCheckedWithUnknownProductTerms extends NamedDomainEvent(
  'credit-application.credit-application.request-checked-with-unknown-product-terms',
) {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    readonly productId: string,
  ) {
    super();
  }
}
