import { IsBoolean, IsInt, IsString } from 'class-validator';

/** The decision as the file recorded it: its outcome, who decided at which level, and when. */
export class DecisionShownLine {
  @IsString()
  outcome = '';

  @IsString()
  deciderId = '';

  @IsString()
  level = '';

  @IsString()
  reasons = '';

  @IsString()
  conditions = '';

  @IsInt()
  approvedAmountCents = 0;

  @IsString()
  branchId = '';

  @IsBoolean()
  exception = false;

  /** The instant of the decision, ISO 8601. */
  @IsString()
  decidedAt = '';
}
