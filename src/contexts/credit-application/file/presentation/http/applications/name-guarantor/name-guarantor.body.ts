import { IsString } from 'class-validator';

/** The person named as guarantor, by the identifier the bank gives them. */
export class NameGuarantorBody {
  @IsString()
  guarantorId = '';
}
