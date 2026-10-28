import { IsString } from 'class-validator';

export class ReadProductTermsFindingsParams {
  @IsString()
  id = '';
}
