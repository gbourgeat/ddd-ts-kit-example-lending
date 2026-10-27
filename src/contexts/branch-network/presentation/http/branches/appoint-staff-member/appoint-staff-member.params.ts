import { IsString } from 'class-validator';

export class AppointStaffMemberParams {
  @IsString()
  id = '';
}
