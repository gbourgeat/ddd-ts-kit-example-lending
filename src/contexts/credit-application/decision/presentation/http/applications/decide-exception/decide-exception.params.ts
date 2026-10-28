import { IsString } from 'class-validator';

export class DecideExceptionParams {
  @IsString()
  id = '';
}
