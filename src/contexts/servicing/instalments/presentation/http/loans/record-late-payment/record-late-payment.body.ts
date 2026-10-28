import { IsInt } from 'class-validator';

export class RecordLatePaymentBody {
  /** The money received for the instalment, in cents. */
  @IsInt()
  amountCents = 0;
}
