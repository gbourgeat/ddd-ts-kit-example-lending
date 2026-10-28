import { IsString } from 'class-validator';

export class ReadPreContractualSheetParams {
  @IsString()
  id = '';
}
