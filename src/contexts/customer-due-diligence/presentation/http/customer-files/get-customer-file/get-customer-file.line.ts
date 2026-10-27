import { IsDateString, IsString } from 'class-validator';

export class GetCustomerFileLine {
  @IsString()
  id = '';

  /** The day the customer was identified, as an ISO date. */
  @IsDateString()
  identifiedAt = '';
}
