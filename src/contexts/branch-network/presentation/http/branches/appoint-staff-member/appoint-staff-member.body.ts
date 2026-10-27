import { IsEmail, IsString } from 'class-validator';

export class AppointStaffMemberBody {
  @IsString()
  name = '';

  @IsEmail()
  email = '';
}
