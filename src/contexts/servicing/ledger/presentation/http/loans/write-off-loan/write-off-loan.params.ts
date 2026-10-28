import { IsString } from 'class-validator';

export class WriteOffLoanParams {
  @IsString()
  id = '';
}
