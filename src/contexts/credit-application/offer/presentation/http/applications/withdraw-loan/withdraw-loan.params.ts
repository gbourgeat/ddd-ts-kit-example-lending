import { IsString } from 'class-validator';

export class WithdrawLoanParams {
  @IsString()
  id = '';
}
