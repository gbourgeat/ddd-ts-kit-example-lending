import type { RiskRating } from '@/contexts/customer-due-diligence/domain/vocabularies/risk-rating.vocabulary';

export interface GetCustomerRiskRatingResult {
  readonly customerId: string;
  /** Absent while the customer has no rating, or when the asker's scope does not reach the customer. */
  readonly riskRating?: RiskRating;
}
