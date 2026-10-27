import { IsString } from 'class-validator';

export class CorrectEntryParams {
  @IsString()
  id = '';
}
