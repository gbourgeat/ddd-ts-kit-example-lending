import { IsIn, IsOptional, IsString } from 'class-validator';
import { RiskRating } from '@/contexts/customer-due-diligence/domain/vocabularies/risk-rating.vocabulary';

export class GetCustomerRiskRatingAnswer {
  @IsString()
  customerId = '';

  @IsOptional()
  @IsIn(Object.values(RiskRating))
  riskRating?: RiskRating;
}
