import { IsString } from 'class-validator';

export class LoanPaidOutV1Payload {
  @IsString()
  loanId = '';

  // TODO(domain): add what downstream contexts need to know about "loan paid out", as decorated primitive fields; this is a public contract: inside version 1 a field can be added, never renamed or removed.
}
