import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { RateBandBody } from '@/contexts/credit-policy/presentation/http/rate-grids/publish-rate-grid/rate-band.body';

export class PublishRateGridBody {
  /** Empty when the client leaves it out: the validator refuses it. */
  @IsString()
  @IsNotEmpty()
  productId = '';

  /** The day from which the grid applies, as an ISO 8601 date; empty when left out, which the validator refuses. */
  @IsDateString()
  effectiveFrom = '';

  /** The bands of the grid, from the shortest duration to the longest; none when the grid prices nothing yet. */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RateBandBody)
  rates: RateBandBody[] = [];
}
