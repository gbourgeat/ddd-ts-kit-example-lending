import { IsString } from 'class-validator';

export class ConflictOfInterestDeclaredV1Payload {
  @IsString()
  conflictOfInterestId = '';

  @IsString()
  staffMemberId = '';

  @IsString()
  customerId = '';
}
