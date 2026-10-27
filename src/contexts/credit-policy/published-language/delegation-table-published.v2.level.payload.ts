import { IsInt, IsString } from 'class-validator';

export class DelegationTablePublishedV2LevelPayload {
  @IsString()
  level = '';

  /** The most a decider of this level may approve, in cents. */
  @IsInt()
  amountCents = 0;
}
