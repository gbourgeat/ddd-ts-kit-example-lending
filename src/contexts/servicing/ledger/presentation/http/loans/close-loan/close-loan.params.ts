import { IsString } from 'class-validator';

export class CloseLoanParams {
  @IsString()
  id = '';
}
