import { IsString } from 'class-validator';

export class ReadDelegationTableParams {
  @IsString()
  delegationTableId = '';
}
