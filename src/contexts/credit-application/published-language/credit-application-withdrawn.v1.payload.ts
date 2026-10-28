import { IsString } from 'class-validator';

export class CreditApplicationWithdrawnV1Payload {
  @IsString()
  creditApplicationId = '';

  // TODO(domain): add what downstream contexts need to know about "credit application withdrawn", as decorated primitive fields; this is a public contract: inside version 1 a field can be added, never renamed or removed.
}
