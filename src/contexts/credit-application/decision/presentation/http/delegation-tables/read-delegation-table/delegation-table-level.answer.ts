import { IsInt, IsString } from 'class-validator';

export class DelegationTableLevelAnswer {
  @IsString()
  level = '';

  /** The most a decider of this level may approve, in cents. */
  @IsInt()
  amountCents = 0;
}
