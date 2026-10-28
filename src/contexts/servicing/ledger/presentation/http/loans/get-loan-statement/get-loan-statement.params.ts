import { IsString } from 'class-validator';

export class GetLoanStatementParams {
  @IsString()
  id = '';
}
