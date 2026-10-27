import { IsString } from 'class-validator';

export class CustomerIdentifiedV1Payload {
  @IsString()
  customerId = '';
}
