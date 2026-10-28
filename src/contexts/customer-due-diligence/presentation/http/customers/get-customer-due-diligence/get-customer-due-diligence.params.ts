import { IsString } from 'class-validator';

export class GetCustomerDueDiligenceParams {
  @IsString()
  id = '';
}
