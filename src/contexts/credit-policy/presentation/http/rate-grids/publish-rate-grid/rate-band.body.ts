import { IsInt, Min } from 'class-validator';

export class RateBandBody {
  /** The longest duration, in months, this band prices. */
  @IsInt()
  @Min(1)
  upToMonths = 0;

  /** The rate of the band, in basis points of a year (1 point = 0.01 percent). */
  @IsInt()
  @Min(0)
  rateBasisPoints = 0;
}
