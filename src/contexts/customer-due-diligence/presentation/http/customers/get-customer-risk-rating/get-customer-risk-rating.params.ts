import { IsString } from 'class-validator';

export class GetCustomerRiskRatingParams {
  @IsString()
  id = '';
}
