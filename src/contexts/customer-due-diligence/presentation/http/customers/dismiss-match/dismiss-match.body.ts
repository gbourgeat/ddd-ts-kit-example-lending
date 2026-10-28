import { IsString } from 'class-validator';

export class DismissMatchBody {
  @IsString()
  reason = '';
}
