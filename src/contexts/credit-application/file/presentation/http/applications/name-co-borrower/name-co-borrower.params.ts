import { IsString } from 'class-validator';

export class NameCoBorrowerParams {
  @IsString()
  id = '';
}
