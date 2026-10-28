import { IsString } from 'class-validator';

export class ConflictOfInterestDeclaredV1Payload {
  @IsString()
  conflictOfInterestId = '';

  @IsString()
  staffMemberId = '';

  @IsString()
  customerId = '';

  /** The account the staff member signs in with: the actor a decision is checked against. */
  @IsString()
  accountId = '';
}
