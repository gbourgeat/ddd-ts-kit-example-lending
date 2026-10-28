import { IsInt, IsISO8601, IsString } from 'class-validator';

export class ReadLegalMaximumRateAnswer {
  @IsString()
  legalMaximumRateId = '';

  @IsString()
  category = '';

  /** The legal maximum of the category, in basis points of a year. */
  @IsInt()
  rateBasisPoints = 0;

  /** The day the maximum takes effect, as an ISO 8601 instant. */
  @IsISO8601()
  effectiveFrom = '';
}
