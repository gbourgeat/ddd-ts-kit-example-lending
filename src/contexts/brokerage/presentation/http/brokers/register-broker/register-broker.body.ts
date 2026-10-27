import { IsString } from 'class-validator';

export class RegisterBrokerBody {
  @IsString()
  registrationNumber = '';
}
