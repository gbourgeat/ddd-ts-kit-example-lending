import { IsIn } from 'class-validator';
import { RiskRating } from '@/contexts/customer-due-diligence/domain/vocabularies/risk-rating.vocabulary';

export class RateCustomerRiskBody {
  /** The risk rating the bank gives the customer: low, medium or high. */
  @IsIn(Object.values(RiskRating))
  rating: RiskRating = RiskRating.Low;
}
