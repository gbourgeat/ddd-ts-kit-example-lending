import { IsString } from 'class-validator';

export class StaffMemberAppointedV2Payload {
  @IsString()
  staffMemberId = '';

  @IsString()
  branchId = '';

  /** The level of the appointment, as the delegation table names it. */
  @IsString()
  level = '';

  /** The account the staff member signs in with: what they decide is decided by this actor. */
  @IsString()
  accountId = '';
}
