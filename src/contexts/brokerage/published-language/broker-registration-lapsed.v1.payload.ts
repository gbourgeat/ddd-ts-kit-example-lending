import { IsString } from 'class-validator';

export class BrokerRegistrationLapsedV1Payload {
  @IsString()
  brokerId = '';
}
