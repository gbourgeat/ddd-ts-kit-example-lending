import { IsString } from 'class-validator';

export class ReadBrokerRegistrationParams {
  @IsString()
  brokerId = '';
}
