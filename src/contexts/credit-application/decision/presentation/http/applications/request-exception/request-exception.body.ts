import { IsString } from 'class-validator';

export class RequestExceptionBody {
  @IsString()
  justification = '';
}
