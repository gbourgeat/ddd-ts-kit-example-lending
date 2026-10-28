import { IsInt } from 'class-validator';

export class RateBandAnswer {
  /** The longest duration, in months, this band prices. */
  @IsInt()
  upToMonths = 0;

  /** The rate of the band, in basis points of a year. */
  @IsInt()
  rateBasisPoints = 0;
}
