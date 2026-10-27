import { IsString } from 'class-validator';

export class DeclareConflictOfInterestBody {
  /** The customer the member of staff declares the link with: a customer file, not their own. */
  @IsString()
  customerId = '';
}
