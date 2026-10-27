import { IsISO8601, IsString } from 'class-validator';

export class RateGridPublishedV2Payload {
  @IsString()
  rateGridId = '';

  @IsString()
  productId = '';

  /** The day the grid takes effect, as an ISO 8601 date. */
  @IsISO8601()
  effectiveFrom = '';
}
