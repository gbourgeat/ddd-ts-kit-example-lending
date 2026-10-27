import { IsString } from 'class-validator';

export class CustomerAdvisorAssignedV1Payload {
  @IsString()
  customerId = '';

  // TODO(domain): add what downstream contexts need to know about "customer advisor assigned", as decorated primitive fields; this is a public contract: inside version 1 a field can be added, never renamed or removed.
}
