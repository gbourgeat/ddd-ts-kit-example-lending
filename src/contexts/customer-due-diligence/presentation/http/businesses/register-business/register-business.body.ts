import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class RegisterBusinessBody {
  /** The customer the bank already knows, whose business is registered. */
  @IsString()
  @IsNotEmpty()
  customerId = '';

  @IsString()
  @IsNotEmpty()
  legalName = '';

  @IsString()
  @IsNotEmpty()
  registrationNumber = '';

  /** The country the business is registered in, as the bank records it. */
  @IsString()
  @IsNotEmpty()
  countryOfRegistration = '';

  /** The day the business was registered, as an ISO date. */
  @IsDateString()
  registeredOn = '';
}
