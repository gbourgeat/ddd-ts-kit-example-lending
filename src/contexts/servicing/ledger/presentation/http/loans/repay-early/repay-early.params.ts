import { IsString } from 'class-validator';

export class RepayEarlyParams {
  @IsString()
  id = '';
}
