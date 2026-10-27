import { IsString } from 'class-validator';

export class StaffMemberAppointedV2Payload {
  @IsString()
  staffMemberId = '';

  @IsString()
  branchId = '';

  /** The level of the appointment, as the delegation table names it. */
  @IsString()
  level = '';
}
