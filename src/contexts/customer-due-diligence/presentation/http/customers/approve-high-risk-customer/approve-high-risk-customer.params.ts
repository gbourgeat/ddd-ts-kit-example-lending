import { IsString } from 'class-validator';

export class ApproveHighRiskCustomerParams {
  @IsString()
  customerId = '';
}
