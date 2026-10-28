import { NamedDomainEvent } from '@ddd-ts-kit/kernel';
import type { RiskRating } from '@/contexts/customer-due-diligence/domain/vocabularies/risk-rating.vocabulary';

export class CustomerRiskRated extends NamedDomainEvent('customer-due-diligence.customer.risk-rated') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    readonly rating: RiskRating,
  ) {
    super();
  }
}
