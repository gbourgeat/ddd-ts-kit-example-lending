import { Type } from 'class-transformer';
import { IsArray, IsISO8601, IsString, ValidateNested } from 'class-validator';
import { RateBandAnswer } from '@/contexts/credit-application/offer/presentation/http/rate-grids/read-rate-grid/rate-band.answer';

export class ReadRateGridAnswer {
  @IsString()
  rateGridId = '';

  @IsString()
  productId = '';

  /** The day the grid takes effect, as an ISO 8601 instant. */
  @IsISO8601()
  effectiveFrom = '';

  /** The bands of the grid: the rate of a credit lasting up to so many months. */
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RateBandAnswer)
  rates: RateBandAnswer[] = [];
}
