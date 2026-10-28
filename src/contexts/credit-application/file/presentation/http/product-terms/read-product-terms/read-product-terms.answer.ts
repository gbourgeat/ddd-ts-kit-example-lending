import { IsBoolean, IsInt, IsString } from 'class-validator';

/** The terms of a product: the amounts it lends, the durations, the arrangement fee and whether the insurance is mandatory. */
export class ReadProductTermsAnswer {
  @IsString()
  productId = '';

  @IsInt()
  amountMinimumCents = 0;

  @IsInt()
  amountMaximumCents = 0;

  @IsInt()
  durationMinimumMonths = 0;

  @IsInt()
  durationMaximumMonths = 0;

  @IsInt()
  arrangementFeeCents = 0;

  @IsBoolean()
  insuranceMandatory = false;
}
