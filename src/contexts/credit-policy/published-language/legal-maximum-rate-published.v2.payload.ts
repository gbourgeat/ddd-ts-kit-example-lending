import { IsInt, IsISO8601, IsString } from 'class-validator';

export class LegalMaximumRatePublishedV2Payload {
  @IsString()
  legalMaximumRateId = '';

  @IsString()
  category = '';

  /** The legal maximum of the category, in basis points of a year (1 point = 0.01 percent). */
  @IsInt()
  rateBasisPoints = 0;

  /** The day the maximum takes effect, as an ISO 8601 date. */
  @IsISO8601()
  effectiveFrom = '';
}
