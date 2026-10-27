import { IsDateString, IsInt } from 'class-validator';

/** Each limit and the day of effect are required: a field left out stays NaN or empty and the validator refuses it. */
export class SetDelegationTableBody {
  /** The day from which the table applies, as an ISO 8601 date; empty when left out, which the validator refuses. */
  @IsDateString()
  effectiveFrom = '';

  @IsInt()
  advisorLimitCents = Number.NaN;

  @IsInt()
  creditAnalystLimitCents = Number.NaN;

  @IsInt()
  riskManagerLimitCents = Number.NaN;

  @IsInt()
  creditCommitteeLimitCents = Number.NaN;
}
