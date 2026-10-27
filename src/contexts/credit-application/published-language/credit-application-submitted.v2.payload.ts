import { IsInt, IsString } from 'class-validator';

export class CreditApplicationSubmittedV2Payload {
  @IsString()
  creditApplicationId = '';

  @IsString()
  applicantId = '';

  @IsInt()
  requestedAmountCents = 0;

  @IsInt()
  durationMonths = 0;

  /** The branch the application was submitted on. */
  @IsString()
  branchId = '';
}
