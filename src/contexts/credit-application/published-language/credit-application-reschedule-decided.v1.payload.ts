import { IsInt, IsString, Min } from 'class-validator';

export class CreditApplicationRescheduleDecidedV1Payload {
  @IsString()
  creditApplicationId = '';

  /** The new duration of the schedule, in whole months. */
  @IsInt()
  @Min(1)
  durationMonths = 1;

  /** The outstanding capital to reschedule, in cents. The rate stays that of the loan. */
  @IsInt()
  outstandingAmountCents = 0;
}
