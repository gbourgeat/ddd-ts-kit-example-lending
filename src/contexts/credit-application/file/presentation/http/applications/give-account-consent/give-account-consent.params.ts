import { IsString } from 'class-validator';

export class GiveAccountConsentParams {
  @IsString()
  id = '';
}
