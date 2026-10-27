import { IsString } from 'class-validator';

export class BrokerRegisteredV1Payload {
  @IsString()
  brokerId = '';
}
