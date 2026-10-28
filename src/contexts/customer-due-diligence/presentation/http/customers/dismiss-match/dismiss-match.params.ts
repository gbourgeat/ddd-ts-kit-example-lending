import { IsString } from 'class-validator';

export class DismissMatchParams {
  @IsString()
  id = '';
}
