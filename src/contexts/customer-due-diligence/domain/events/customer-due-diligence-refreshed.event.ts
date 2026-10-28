import { NamedDomainEvent } from '@ddd-ts-kit/kernel';
import type { RiskRating } from '@/contexts/customer-due-diligence/domain/vocabularies/risk-rating.vocabulary';

/** The refresh of the due diligence of a customer: the screening outcome, the date it falls due again, the risk rating restated when there is one. */
export class CustomerDueDiligenceRefreshed extends NamedDomainEvent(
  'customer-due-diligence.customer.due-diligence-refreshed',
) {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    readonly possibleMatch: boolean,
    readonly nextDueOn: Date,
    readonly riskRating?: RiskRating,
  ) {
    super();
  }
}
