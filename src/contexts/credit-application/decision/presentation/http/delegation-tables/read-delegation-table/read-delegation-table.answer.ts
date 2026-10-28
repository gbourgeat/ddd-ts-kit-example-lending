import { Type } from 'class-transformer';
import { IsArray, IsISO8601, IsString, ValidateNested } from 'class-validator';
import { DelegationTableLevelAnswer } from '@/contexts/credit-application/decision/presentation/http/delegation-tables/read-delegation-table/delegation-table-level.answer';

export class ReadDelegationTableAnswer {
  @IsString()
  delegationTableId = '';

  /** The day the table takes effect, as an ISO 8601 instant. */
  @IsISO8601()
  effectiveFrom = '';

  /** Each level of the table with the amount its deciders may approve. */
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DelegationTableLevelAnswer)
  levels: DelegationTableLevelAnswer[] = [];
}
