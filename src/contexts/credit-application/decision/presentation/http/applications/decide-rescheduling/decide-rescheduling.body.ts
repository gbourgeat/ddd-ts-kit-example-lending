import { IsInt, Min } from 'class-validator';

export class DecideReschedulingBody {
  @IsInt()
  durationMonths = 0;

  @IsInt()
  @Min(0)
  outstandingAmountCents = 0;
}
