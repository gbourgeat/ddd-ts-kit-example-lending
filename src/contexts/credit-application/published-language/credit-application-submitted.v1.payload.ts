import { IsInt, IsString } from 'class-validator';

export class CreditApplicationSubmittedV1Payload {
  @IsString()
  creditApplicationId = '';

  @IsString()
  applicantId = '';

  @IsInt()
  requestedAmountCents = 0;

  @IsInt()
  durationMonths = 0;
}
