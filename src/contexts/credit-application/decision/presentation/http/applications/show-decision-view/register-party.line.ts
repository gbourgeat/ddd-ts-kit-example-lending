import { IsBoolean, IsString } from 'class-validator';

/** One party of the application as the register answered: never a name nor a birth date. */
export class RegisterPartyLine {
  @IsString()
  customerId = '';

  @IsBoolean()
  listed = false;
}
