import { IsInt, IsString, Min } from 'class-validator';

export class LoanPaymentReceivedV1Payload {
  @IsString()
  loanId = '';

  /** The number of the instalment of the schedule the payment settles. */
  @IsInt()
  @Min(1)
  instalmentNumber = 1;

  /** The amount received, in cents. */
  @IsInt()
  amountCents = 0;
}
