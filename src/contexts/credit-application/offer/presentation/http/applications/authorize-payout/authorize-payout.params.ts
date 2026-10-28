import { IsString } from 'class-validator';

export class AuthorizePayoutParams {
  @IsString()
  id = '';
}
