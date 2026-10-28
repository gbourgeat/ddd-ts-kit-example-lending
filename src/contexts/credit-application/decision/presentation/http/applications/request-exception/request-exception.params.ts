import { IsString } from 'class-validator';

export class RequestExceptionParams {
  @IsString()
  id = '';
}
