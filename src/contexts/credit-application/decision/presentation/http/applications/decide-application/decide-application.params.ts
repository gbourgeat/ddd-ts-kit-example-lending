import { IsString } from 'class-validator';

export class DecideApplicationParams {
  @IsString()
  id = '';
}
