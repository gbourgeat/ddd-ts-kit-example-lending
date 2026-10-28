import { IsString } from 'class-validator';

export class ReadLoanParams {
  @IsString()
  id = '';
}
