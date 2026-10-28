import { IsDateString, IsOptional, IsString } from 'class-validator';

export class GetCustomerDueDiligenceAnswer {
  @IsString()
  customerId = '';

  /** The date of the last refresh, absent while the customer was never refreshed. */
  @IsOptional()
  @IsDateString()
  refreshedOn?: string;

  /** The date the due diligence falls due again, absent while the customer was never refreshed. */
  @IsOptional()
  @IsDateString()
  nextDueOn?: string;
}
