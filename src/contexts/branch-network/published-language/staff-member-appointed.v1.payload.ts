import { IsString } from 'class-validator';

export class StaffMemberAppointedV1Payload {
  @IsString()
  staffMemberId = '';
}
