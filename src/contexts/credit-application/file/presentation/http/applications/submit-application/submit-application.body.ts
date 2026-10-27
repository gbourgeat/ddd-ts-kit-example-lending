import { Type } from 'class-transformer';
import { IsDefined, IsNumber, IsString, ValidateNested } from 'class-validator';
import { RequestedAmountBody } from '@/contexts/credit-application/file/presentation/http/applications/submit-application/requested-amount.body';

export class SubmitApplicationBody {
  /** Accepted, not used yet: the product catalogue is US3. */
  @IsString()
  declare readonly productId: string;

  @IsDefined()
  @ValidateNested()
  @Type(() => RequestedAmountBody)
  declare readonly amount: RequestedAmountBody;

  @IsNumber()
  declare readonly durationMonths: number;
}
