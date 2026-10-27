import { IsEmail, IsOptional, IsString } from 'class-validator';

export class AppointStaffMemberBody {
  @IsString()
  name = '';

  @IsEmail()
  email = '';

  /** The identity account the member of staff signs in with. */
  @IsString()
  accountId = '';

  /** The customer file that is the member of staff's own, when they are also a customer. */
  @IsOptional()
  @IsString()
  ownCustomerId?: string;
}
