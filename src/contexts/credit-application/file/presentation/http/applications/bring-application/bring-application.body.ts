import { Type } from 'class-transformer';
import { IsDefined, IsNumber, IsString, ValidateNested } from 'class-validator';
import { RequestedAmountBody } from '@/contexts/credit-application/file/presentation/http/applications/submit-application/requested-amount.body';

export class BringApplicationBody {
  /** The customer the application is brought for: the customer who is the applicant of the file. */
  @IsString()
  declare readonly customerId: string;

  @IsString()
  declare readonly productId: string;

  @IsDefined()
  @ValidateNested()
  @Type(() => RequestedAmountBody)
  declare readonly amount: RequestedAmountBody;

  @IsNumber()
  declare readonly durationMonths: number;
}
