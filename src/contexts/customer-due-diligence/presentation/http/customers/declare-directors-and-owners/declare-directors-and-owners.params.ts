import { IsString } from 'class-validator';

export class DeclareDirectorsAndOwnersParams {
  @IsString()
  id = '';
}
