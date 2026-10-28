import { IsISO8601, IsString } from 'class-validator';

export class ReadRateGridAnswer {
  @IsString()
  rateGridId = '';

  @IsString()
  productId = '';

  /** The day the grid takes effect, as an ISO 8601 instant. */
  @IsISO8601()
  effectiveFrom = '';
}
