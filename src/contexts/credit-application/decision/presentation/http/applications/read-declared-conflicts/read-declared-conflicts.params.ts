import { IsString } from 'class-validator';

export class ReadDeclaredConflictsParams {
  @IsString()
  id = '';
}
