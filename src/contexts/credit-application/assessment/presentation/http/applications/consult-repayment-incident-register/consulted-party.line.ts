import { IsBoolean, IsString } from 'class-validator';

/** One party as the register was consulted for it: its name and birth date, and whether the register lists it. */
export class ConsultedPartyLine {
  @IsString()
  customerId = '';

  @IsString()
  name = '';

  @IsString()
  birthDate = '';

  @IsBoolean()
  listed = false;
}
