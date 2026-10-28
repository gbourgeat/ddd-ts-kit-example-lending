import { IsString } from 'class-validator';

export class ConsultRepaymentIncidentRegisterParams {
  @IsString()
  id = '';
}
