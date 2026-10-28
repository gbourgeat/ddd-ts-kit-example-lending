import { IsArray, IsISO8601, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { RateGridPublishedV2BandPayload } from '@/contexts/credit-policy/published-language/rate-grid-published.v2.band.payload';

export class RateGridPublishedV2Payload {
  @IsString()
  rateGridId = '';

  @IsString()
  productId = '';

  /** The day the grid takes effect, as an ISO 8601 date. */
  @IsISO8601()
  effectiveFrom = '';

  /** The bands of the grid: the rate of a credit lasting up to so many months. Empty for a grid that prices nothing. */
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RateGridPublishedV2BandPayload)
  rates: RateGridPublishedV2BandPayload[] = [];
}
