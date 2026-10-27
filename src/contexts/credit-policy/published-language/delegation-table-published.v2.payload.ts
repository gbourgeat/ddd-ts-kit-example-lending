import { IsArray, IsISO8601, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { DelegationTablePublishedV2LevelPayload } from '@/contexts/credit-policy/published-language/delegation-table-published.v2.level.payload';

export class DelegationTablePublishedV2Payload {
  @IsString()
  delegationTableId = '';

  /** The day the table takes effect, as an ISO 8601 date. */
  @IsISO8601()
  effectiveFrom = '';

  /** Each level of the table with the amount its deciders may approve. */
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DelegationTablePublishedV2LevelPayload)
  levels: DelegationTablePublishedV2LevelPayload[] = [];
}
