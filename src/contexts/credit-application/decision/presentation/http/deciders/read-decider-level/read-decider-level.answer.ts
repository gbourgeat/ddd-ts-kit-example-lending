import { IsString } from 'class-validator';

export class ReadDeciderLevelAnswer {
  @IsString()
  staffMemberId = '';

  @IsString()
  branchId = '';

  /** The level the staff member was appointed to, as the delegation table names it. */
  @IsString()
  level = '';
}
