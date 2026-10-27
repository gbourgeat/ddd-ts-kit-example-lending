import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { RequestedAmountBody } from '@/contexts/credit-application/file/presentation/http/applications/submit-application/requested-amount.body';

/** The application as the answer of its submission carries it. */
export class ApplicationSubmittedBody {
  @IsString()
  declare readonly id: string;

  @ValidateNested()
  @Type(() => RequestedAmountBody)
  declare readonly amount: RequestedAmountBody;
}
