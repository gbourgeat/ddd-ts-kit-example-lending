import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class PublishRateGridBody {
  /** Empty when the client leaves it out: the validator refuses it. */
  @IsString()
  @IsNotEmpty()
  productId = '';

  /** The day from which the grid applies, as an ISO 8601 date; empty when left out, which the validator refuses. */
  @IsDateString()
  effectiveFrom = '';
}
