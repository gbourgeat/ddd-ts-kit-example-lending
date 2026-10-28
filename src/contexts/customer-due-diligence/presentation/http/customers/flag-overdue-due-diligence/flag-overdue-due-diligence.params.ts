import { IsString } from 'class-validator';

export class FlagOverdueDueDiligenceParams {
  @IsString()
  customerId = '';
}
