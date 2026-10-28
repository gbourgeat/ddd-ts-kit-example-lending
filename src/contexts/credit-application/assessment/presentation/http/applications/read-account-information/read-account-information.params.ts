import { IsString } from 'class-validator';

export class ReadAccountInformationParams {
  @IsString()
  id = '';
}
