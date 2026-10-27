import { IsString } from 'class-validator';

export class ConfirmSanctionsMatchParams {
  @IsString()
  id = '';
}
