import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

export class RateGridPublished extends NamedDomainEvent('credit-policy.rate-grid.published') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
  ) {
    super();
  }
}
