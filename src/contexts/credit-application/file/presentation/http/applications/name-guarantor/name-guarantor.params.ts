import { IsString } from 'class-validator';

export class NameGuarantorParams {
  @IsString()
  id = '';
}
