import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class ScreenCustomerBody {
  /** The name of the person, as the screening lists spell it. */
  @IsString()
  @IsNotEmpty()
  name = '';

  /** The birth date of the person, as an ISO date. */
  @IsDateString()
  birthDate = '';
}
