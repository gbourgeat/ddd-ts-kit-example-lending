import { IsDateString, IsInt, IsNotEmpty, IsString } from 'class-validator';

/** Each field is required: a field left out stays empty or NaN and the validator refuses it. */
export class PublishLegalMaximumRateBody {
  @IsString()
  @IsNotEmpty()
  category = '';

  @IsInt()
  rateBasisPoints = Number.NaN;

  /** The day from which the rate applies, as an ISO 8601 date; empty when left out, which the validator refuses. */
  @IsDateString()
  effectiveFrom = '';
}
