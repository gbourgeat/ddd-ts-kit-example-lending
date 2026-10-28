import { IsString } from 'class-validator';

export class AssessApplicationParams {
  @IsString()
  id = '';
}
