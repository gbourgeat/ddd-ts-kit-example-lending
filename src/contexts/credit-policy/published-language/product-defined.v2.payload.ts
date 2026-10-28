import { IsBoolean, IsInt, IsString, Min } from 'class-validator';

export class ProductDefinedV2Payload {
  @IsString()
  productId = '';

  /** The smallest amount the product lends, in cents. */
  @IsInt()
  @Min(0)
  amountMinimumCents = 0;

  /** The largest amount the product lends, in cents. */
  @IsInt()
  @Min(0)
  amountMaximumCents = 0;

  /** The shortest duration of a loan of the product, in months. */
  @IsInt()
  @Min(0)
  durationMinimumMonths = 0;

  /** The longest duration of a loan of the product, in months. */
  @IsInt()
  @Min(0)
  durationMaximumMonths = 0;

  /** The arrangement fee charged once, in cents. */
  @IsInt()
  @Min(0)
  arrangementFeeCents = 0;

  /** Whether a borrower must take the insurance. */
  @IsBoolean()
  insuranceMandatory = false;
}
