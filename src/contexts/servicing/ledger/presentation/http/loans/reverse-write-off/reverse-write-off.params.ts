import { IsString } from 'class-validator';

export class ReverseWriteOffParams {
  @IsString()
  id = '';
}
