import { IsBoolean, IsInt } from 'class-validator';

/** Each amount, duration, the fee and the threshold are required: a field left out stays NaN and the validator refuses it. */
export class DefineProductBody {
  @IsInt()
  amountMinimumCents = Number.NaN;

  @IsInt()
  amountMaximumCents = Number.NaN;

  @IsInt()
  durationMinimumMonths = Number.NaN;

  @IsInt()
  durationMaximumMonths = Number.NaN;

  @IsInt()
  arrangementFeeCents = Number.NaN;

  @IsBoolean()
  insuranceMandatory = false;

  @IsInt()
  scoreThreshold = Number.NaN;
}
