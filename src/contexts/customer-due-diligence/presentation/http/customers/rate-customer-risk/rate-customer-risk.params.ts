import { IsString } from 'class-validator';

export class RateCustomerRiskParams {
  @IsString()
  id = '';
}
