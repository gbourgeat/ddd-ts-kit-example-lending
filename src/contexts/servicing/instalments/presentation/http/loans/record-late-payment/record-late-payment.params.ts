import { IsString } from 'class-validator';

export class RecordLatePaymentParams {
  @IsString()
  id = '';

  /** The number, counted from one, of the instalment paid late. */
  @IsString()
  number = '';
}
