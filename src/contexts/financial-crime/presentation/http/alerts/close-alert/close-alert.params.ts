import { IsString } from 'class-validator';

export class CloseAlertParams {
  @IsString()
  id = '';
}
