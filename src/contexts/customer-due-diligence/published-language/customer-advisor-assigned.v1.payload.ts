import { IsString } from 'class-validator';

export class CustomerAdvisorAssignedV1Payload {
  @IsString()
  customerId = '';

  @IsString()
  advisorId = '';
}
