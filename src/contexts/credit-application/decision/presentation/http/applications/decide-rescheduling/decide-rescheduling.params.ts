import { IsString } from 'class-validator';

export class DecideReschedulingParams {
  @IsString()
  id = '';
}
