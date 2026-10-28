import { NamedDomainEvent } from '@ddd-ts-kit/kernel';
import type { RateGridPublication } from '@/contexts/credit-policy/domain/aggregates/rate-grid.aggregate';

export class RateGridPublished extends NamedDomainEvent('credit-policy.rate-grid.published') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    readonly publication: RateGridPublication,
  ) {
    super();
  }
}
