import { IsString } from 'class-validator';

/** One conflict of interest declared on the applicant, as the decider reads it: who declared it and on whom. */
export class DeclaredConflictLine {
  @IsString()
  conflictOfInterestId = '';

  @IsString()
  staffMemberId = '';

  @IsString()
  customerId = '';
}
